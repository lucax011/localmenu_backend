/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
// As respostas HTTP chegam como JSON sem tipo: os testes leem campos livremente.
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.Module';
import { configureApp } from '../src/app.setup';
import { AiService } from '../src/modules/ai/services/ai.service';
import { PrismaService } from '../src/modules/prisma/services/prismaServiceSetup';

// Percorre as jornadas do MVP pela API, com um banco de teste próprio.
// O serviço de OCR é simulado: aqui interessa o caminho foto -> revisão -> cardápio.
const OCR_ITEMS = [
  {
    name: 'X-Burger',
    price: 24.9,
    description: 'Pão, carne e queijo',
    category: 'Lanches',
    confidence: 0.91,
  },
  {
    name: 'Refrigerante lata',
    price: 6,
    description: null,
    category: 'Bebidas',
    confidence: 0.88,
  },
];

// sufixo único por execução: o banco de teste não precisa ser apagado entre execuções
const RUN = Date.now().toString(36);
const mail = (name: string) => `${name}-${RUN}@x.dev`;

describe('LocalMenu (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let prisma: PrismaService;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const register = async (name: string, userType: 'OWNER' | 'CUSTOMER') => {
    const res = await http
      .post('/auth/register')
      .send({
        email: mail(name),
        password: 'senha123',
        name: 'Pessoa Teste',
        userType,
      })
      .expect(201);
    return res.body.accessToken as string;
  };

  let owner: string;
  let otherOwner: string;
  let customer: string;
  let restaurantId: string;
  let slug: string;
  let menuId: string;
  let burgerId: string;
  let pausedId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AiService)
      .useValue({
        extractMenuFromImage: jest.fn().mockResolvedValue({
          items: OCR_ITEMS,
          metadata: { engine: 'tesseract', processing_ms: 10 },
        }),
      })
      .compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    http = request(app.getHttpServer());
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('segurança', () => {
    it('não deixa ninguém se cadastrar como ADMIN', async () => {
      await http
        .post('/auth/register')
        .send({
          email: mail('admin'),
          password: 'senha123',
          name: 'Admin',
          userType: 'ADMIN',
        })
        .expect(400);
    });

    it('não lista usuários e exige login para ver o perfil', async () => {
      await http.get('/users').expect(404);
      await http.get('/users/me').expect(401);
    });

    it('o perfil nunca devolve senha nem hash do refresh token', async () => {
      const token = await register('perfil', 'CUSTOMER');
      const res = await http.get('/auth/profile').set(auth(token)).expect(200);
      expect(res.body.email).toBe(mail('perfil'));
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('refreshTokenHash');
    });

    it('mexer em cardápio exige login de dono', async () => {
      await http
        .post('/menus/item')
        .send({ name: 'X', price: 1, categoryId: 'a' })
        .expect(401);
      const token = await register('cliente-curioso', 'CUSTOMER');
      await http
        .post('/menus/item')
        .set(auth(token))
        .send({ name: 'X', price: 1, categoryId: 'a' })
        .expect(403);
    });
  });

  describe('jornada do restaurante', () => {
    it('cria o restaurante com endereço público (slug)', async () => {
      owner = await register('dono', 'OWNER');
      otherOwner = await register('outro-dono', 'OWNER');
      const body = {
        name: `Lanchonete do Zé ${RUN}`,
        phone: '(11) 4000-0000',
        address: 'Rua A, 1',
        latitude: -23.5,
        longitude: -46.6,
      };
      const res = await http
        .post('/restaurants')
        .set(auth(owner))
        .send(body)
        .expect(201);
      restaurantId = res.body.id;
      slug = res.body.slug;
      expect(slug).toBe(`lanchonete-do-ze-${RUN}`);

      const twin = await http
        .post('/restaurants')
        .set(auth(otherOwner))
        .send(body)
        .expect(201);
      expect(twin.body.slug).toBe(`${slug}-2`);
    });

    it('monta o cardápio: categoria, itens e edição', async () => {
      const menu = await http
        .post(`/menus/${restaurantId}`)
        .set(auth(owner))
        .send({ name: 'Cardápio Principal' })
        .expect(201);
      menuId = menu.body.id;

      const cat = await http
        .post(`/menus/category/${menuId}`)
        .set(auth(owner))
        .send({ name: 'Pratos' })
        .expect(201);

      const item = await http
        .post('/menus/item')
        .set(auth(owner))
        .send({ name: 'Prato feito', price: 25, categoryId: cat.body.id })
        .expect(201);
      burgerId = item.body.id;

      const paused = await http
        .post('/menus/item')
        .set(auth(owner))
        .send({
          name: 'Feijoada',
          price: 40,
          categoryId: cat.body.id,
          isAvailable: false,
        })
        .expect(201);
      pausedId = paused.body.id;

      const edited = await http
        .patch(`/menus/item/${burgerId}`)
        .set(auth(owner))
        .send({ price: 27.5 })
        .expect(200);
      expect(edited.body.price).toBe(27.5); // número, não texto
    });

    it('envia foto e põe no item e na capa do restaurante', async () => {
      const png = Buffer.from('89504e470d0a1a0a', 'hex');
      const up = await http
        .post('/uploads/image')
        .set(auth(owner))
        .attach('file', png, {
          filename: 'prato.png',
          contentType: 'image/png',
        })
        .expect(201);
      expect(up.body.url).toMatch(/^\/static\/[0-9a-f-]{36}\.png$/);

      const item = await http
        .patch(`/menus/item/${burgerId}`)
        .set(auth(owner))
        .send({ imageUrl: up.body.url })
        .expect(200);
      expect(item.body.imageUrl).toBe(up.body.url);

      await http
        .patch(`/restaurants/${restaurantId}`)
        .set(auth(owner))
        .send({ coverUrl: 'https://cdn.exemplo.com/capa.jpg' })
        .expect(200);

      // só https ou arquivo enviado: nada de javascript: nem caminho solto
      for (const bad of [
        'javascript:alert(1)',
        'http://x.com/a.jpg',
        '/static/../.env',
      ]) {
        await http
          .patch(`/menus/item/${burgerId}`)
          .set(auth(owner))
          .send({ imageUrl: bad })
          .expect(400);
      }

      // cliente não envia foto
      const curioso = await register('curioso', 'CUSTOMER');
      await http
        .post('/uploads/image')
        .set(auth(curioso))
        .attach('file', png, { filename: 'p.png', contentType: 'image/png' })
        .expect(403);
    });

    it('outro dono não mexe no cardápio de ninguém', async () => {
      await http
        .patch(`/menus/item/${burgerId}`)
        .set(auth(otherOwner))
        .send({ price: 1 })
        .expect(403);
      await http
        .get(`/menus/${restaurantId}`)
        .set(auth(otherOwner))
        .expect(403);
    });

    it('importa por foto: lê, devolve para revisão e só publica depois', async () => {
      const png = Buffer.from('89504e470d0a1a0a', 'hex');
      const upload = await http
        .post('/uploads/ocr')
        .set(auth(owner))
        .field('restaurantId', restaurantId)
        .attach('file', png, {
          filename: 'cardapio.png',
          contentType: 'image/png',
        })
        .expect(201);
      expect(upload.body.menuId).toBe(menuId);
      expect(upload.body.items).toHaveLength(2);

      // nada entrou no cardápio ainda
      const before = await http
        .get(`/menus/${restaurantId}`)
        .set(auth(owner))
        .expect(200);
      expect(before.body[0].categories.map((c) => c.name)).toEqual(['Pratos']);

      // o dono corrige o preço lido errado e publica
      const reviewed = upload.body.items.map((i) =>
        i.name === 'X-Burger' ? { ...i, price: 26 } : i,
      );
      const res = await http
        .post(`/menus/${menuId}/import`)
        .set(auth(owner))
        .send({ uploadId: upload.body.uploadId, items: reviewed })
        .expect(201);
      expect(res.body.created).toBe(2);
      const names = res.body.menu.categories.map((c) => c.name);
      expect(names).toEqual(['Pratos', 'Lanches', 'Bebidas']);
      const burger = res.body.menu.categories[1].items[0];
      expect(burger).toMatchObject({
        name: 'X-Burger',
        price: 26,
        confidence: 0.91,
      });
    });

    it('recusa arquivo que não é imagem', async () => {
      await http
        .post('/uploads/ocr')
        .set(auth(owner))
        .field('restaurantId', restaurantId)
        .attach('file', Buffer.from('oi'), {
          filename: 'menu.txt',
          contentType: 'text/plain',
        })
        .expect(400);
    });
  });

  describe('jornada do cliente', () => {
    it('vê restaurantes e cardápio sem login', async () => {
      const list = await http.get('/public/restaurants').expect(200);
      const mine = list.body.find((r) => r.slug === slug);
      expect(mine).toMatchObject({ name: `Lanchonete do Zé ${RUN}`, menuId });
      expect(mine).not.toHaveProperty('ownerId');

      const page = await http.get(`/public/r/${slug}`).expect(200);
      expect(page.body.restaurant.name).toBe(`Lanchonete do Zé ${RUN}`);
      expect(page.body.menu.categories).toHaveLength(3);
      const pratos = page.body.menu.categories[0].items;
      const prato = pratos.find((i) => i.name === 'Prato feito');
      expect(prato.price).toBe(27.5);
      expect(prato.imageUrl).toMatch(/^\/static\//);
      expect(page.body.restaurant.coverUrl).toBe(
        'https://cdn.exemplo.com/capa.jpg',
      );
      // item pausado aparece, marcado como indisponível
      expect(pratos.find((i) => i.name === 'Feijoada').isAvailable).toBe(false);

      await http.get('/public/r/nao-existe').expect(404);
    });

    it('faz o pedido com o preço do cardápio, não o do app', async () => {
      customer = await register('cliente', 'CUSTOMER');
      const res = await http
        .post('/orders')
        .set(auth(customer))
        .send({
          restaurantId,
          items: [{ menuItemId: burgerId, quantity: 2, price: 0.01 }],
          customerNotes: 'sem cebola',
        })
        .expect(201);
      orderId = res.body.id;
      expect(res.body.total).toBe(55);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.restaurant.name).toBe(`Lanchonete do Zé ${RUN}`);
    });

    it('recusa item pausado', async () => {
      const res = await http
        .post('/orders')
        .set(auth(customer))
        .send({ restaurantId, items: [{ menuItemId: pausedId, quantity: 1 }] })
        .expect(400);
      expect(res.body.message).toContain('Feijoada');
    });

    it('paga (simulado) e o pedido fica confirmado', async () => {
      const pay = await http
        .post('/payments')
        .set(auth(customer))
        .send({ orderId, method: 'PIX' })
        .expect(201);
      expect(pay.body).toMatchObject({ status: 'PAID', amount: 55 });
      await http
        .post('/payments')
        .set(auth(customer))
        .send({ orderId, method: 'PIX' })
        .expect(409);

      const mine = await http.get('/orders/me').set(auth(customer)).expect(200);
      expect(mine.body[0]).toMatchObject({ id: orderId, status: 'CONFIRMED' });
    });

    it('outro cliente não vê o pedido', async () => {
      const intruder = await register('intruso', 'CUSTOMER');
      await http.get(`/orders/${orderId}`).set(auth(intruder)).expect(404);
    });
  });

  describe('restaurante atende o pedido', () => {
    it('vê o pedido com só o nome e o telefone do cliente', async () => {
      const res = await http
        .get(`/orders/restaurant/${restaurantId}`)
        .set(auth(owner))
        .expect(200);
      expect(res.body[0].customer).toEqual({
        id: expect.any(String),
        name: 'Pessoa Teste',
        phone: null,
      });
      expect(res.body[0].customerNotes).toBe('sem cebola');
    });

    it('avança o status só pelo caminho permitido', async () => {
      const go = (status: string) =>
        http
          .patch(`/orders/${orderId}/status`)
          .set(auth(owner))
          .send({ status });
      await go('COMPLETED').expect(400);
      await go('PREPARING').expect(200);
      await go('CANCELLED').expect(400);
      await go('READY').expect(200);
      await go('COMPLETED').expect(200);

      const mine = await http
        .get(`/orders/${orderId}`)
        .set(auth(customer))
        .expect(200);
      expect(mine.body.status).toBe('COMPLETED');
    });

    it('relatório soma o faturamento e os itens mais vendidos', async () => {
      const res = await http
        .get(`/restaurants/${restaurantId}/report?days=7`)
        .set(auth(owner))
        .expect(200);
      expect(res.body).toMatchObject({
        orders: 1,
        paidOrders: 1,
        revenue: 55,
        averageTicket: 55,
      });
      expect(res.body.topItems[0]).toEqual({
        name: 'Prato feito',
        quantity: 2,
        revenue: 55,
      });
      await http
        .get(`/restaurants/${restaurantId}/report`)
        .set(auth(otherOwner))
        .expect(403);
    });

    it('item já pedido não pode ser apagado, só pausado', async () => {
      await http.delete(`/menus/item/${burgerId}`).set(auth(owner)).expect(409);
      expect(await prisma.menuItem.count({ where: { id: burgerId } })).toBe(1);
    });
  });
});
