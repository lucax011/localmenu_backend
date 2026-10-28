// Dados de exemplo para desenvolvimento local (npx prisma db seed).
// Só cria os dados uma vez: se a conta do dono de exemplo já existir, só confere as fotos.
//
// Contas de exemplo (senha localmenu123, só para o ambiente local):
//   dono@localmenu.dev     dono da Brasa Burger (app B2B)
//   cliente@localmenu.dev  cliente (app B2C)
import {
  DayOfWeek,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PASSWORD = 'localmenu123';

type Item = [name: string, price: number, description?: string];
type Menu = Record<string, Item[]>;

const RESTAURANTS: {
  slug: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  owner: string;
  menu: Menu;
}[] = [
  {
    slug: 'brasa-burger',
    name: 'Brasa Burger',
    description: 'Hambúrguer artesanal na brasa, batata rústica e milk-shakes.',
    phone: '(11) 4000-1001',
    address: 'Rua dos Pinheiros, 120 - São Paulo',
    latitude: -23.5617,
    longitude: -46.6818,
    owner: 'dono@localmenu.dev',
    menu: {
      Lanches: [
        [
          'Brasa Clássico',
          32.9,
          'Blend 160 g, queijo prato, alface, tomate e molho da casa',
        ],
        [
          'Brasa Bacon',
          38.9,
          'Blend 160 g, cheddar, bacon crocante e cebola caramelizada',
        ],
        ['Duplo Smash', 36.5, 'Dois smash de 90 g, queijo americano e picles'],
        [
          'Veggie da Horta',
          34.0,
          'Burger de grão-de-bico, rúcula, tomate seco e maionese verde',
        ],
      ],
      Acompanhamentos: [
        ['Batata rústica', 18.0, 'Com alecrim e páprica'],
        ['Onion rings', 21.0, 'Anéis de cebola empanados'],
      ],
      Bebidas: [
        ['Milk-shake de doce de leite', 22.0],
        ['Refrigerante lata', 7.0],
        ['Suco de laranja', 10.0, 'Natural, 400 ml'],
      ],
    },
  },
  {
    slug: 'cantina-da-nonna',
    name: 'Cantina da Nonna',
    description: 'Massas frescas e molhos de receita de família.',
    phone: '(11) 4000-2002',
    address: 'Rua Treze de Maio, 450 - São Paulo',
    latitude: -23.5596,
    longitude: -46.6447,
    owner: 'nonna@localmenu.dev',
    menu: {
      Entradas: [
        [
          'Bruschetta de tomate',
          24.0,
          'Pão italiano, tomate, manjericão e azeite',
        ],
        ['Polpettine', 29.0, 'Almôndegas ao sugo com parmesão'],
      ],
      Massas: [
        [
          'Spaghetti à carbonara',
          54.0,
          'Guanciale, ovos, pecorino e pimenta-do-reino',
        ],
        [
          'Lasanha à bolonhesa',
          58.0,
          'Camadas de massa fresca, ragu e bechamel',
        ],
        [
          'Nhoque ao sugo',
          46.0,
          'Nhoque de batata com molho de tomate da casa',
        ],
      ],
      Sobremesas: [['Tiramisù', 26.0, 'Mascarpone, café e cacau']],
    },
  },
  {
    slug: 'sushi-kaze',
    name: 'Sushi Kaze',
    description: 'Sushis, temakis e pratos quentes japoneses.',
    phone: '(11) 4000-3003',
    address: 'Rua Galvão Bueno, 300 - São Paulo',
    latitude: -23.5584,
    longitude: -46.6352,
    owner: 'kaze@localmenu.dev',
    menu: {
      Combinados: [
        ['Combinado 20 peças', 79.9, 'Sashimi, niguiri e uramaki do dia'],
        ['Combinado salmão 12 peças', 54.9],
      ],
      Temakis: [
        ['Temaki salmão', 32.0, 'Salmão, cebolinha e gergelim'],
        ['Temaki skin', 26.0, 'Pele de salmão crocante e molho tarê'],
      ],
      Quentes: [
        ['Yakisoba de legumes', 42.0],
        ['Guioza (6 un.)', 28.0, 'Pastel japonês de porco e legumes'],
      ],
    },
  },
];

// Fotos de exemplo (Unsplash). Itens sem foto ficam assim de propósito:
// o app precisa ficar bom também quando o restaurante não mandou foto.
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&q=70&auto=format&fit=crop`;

const PHOTOS: Record<string, { cover: string; items: Record<string, string> }> =
  {
    'brasa-burger': {
      cover: photo('1568901346375-23c9450c58cd'),
      items: {
        'Brasa Clássico': photo('1571091718767-18b5b1457add'),
        'Brasa Bacon': photo('1586190848861-99aa4a171e90'),
        'Duplo Smash': photo('1550547660-d9450f859349'),
        'Veggie da Horta': photo('1520072959219-c595dc870360'),
        'Batata rústica': photo('1573080496219-bb080dd4f877'),
        'Onion rings': photo('1639024471283-03518883512d'),
        'Milk-shake de doce de leite': photo('1572490122747-3968b75cc699'),
        'Suco de laranja': photo('1600271886742-f049cd451bba'),
      },
    },
    'cantina-da-nonna': {
      cover: photo('1414235077428-338989a2e8c0'),
      items: {
        'Spaghetti à carbonara': photo('1612874742237-6526221588e3'),
        'Lasanha à bolonhesa': photo('1574894709920-11b28e7367e3'),
        Tiramisù: photo('1571877227200-a0d98ea607e9'),
      },
    },
    'sushi-kaze': {
      cover: photo('1553621042-f6e147245754'),
      items: {
        'Combinado 20 peças': photo('1611143669185-af224c5e3252'),
        'Combinado salmão 12 peças': photo('1579871494447-9811cf80d66c'),
        'Yakisoba de legumes': photo('1585032226651-759b368d7246'),
        'Guioza (6 un.)': photo('1496116218417-1a781b1c416c'),
      },
    },
  };

// Põe as fotos onde ainda não há foto. Roda sempre, então bancos criados
// antes das fotos também recebem, e uma foto trocada pelo dono não é sobrescrita.
async function applyPhotos() {
  for (const [slug, p] of Object.entries(PHOTOS)) {
    const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (!restaurant) continue;
    await prisma.restaurant.updateMany({
      where: { id: restaurant.id, coverUrl: null },
      data: { coverUrl: p.cover },
    });
    for (const [name, imageUrl] of Object.entries(p.items)) {
      await prisma.menuItem.updateMany({
        where: {
          name,
          imageUrl: null,
          category: { menu: { restaurantId: restaurant.id } },
        },
        data: { imageUrl },
      });
    }
  }
}

const WEEK: DayOfWeek[] = [
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

async function main() {
  if (
    await prisma.user.findUnique({ where: { email: 'dono@localmenu.dev' } })
  ) {
    await applyPhotos();
    console.log('Seed: dados de exemplo já existem; fotos conferidas.');
    return;
  }
  const password = await bcrypt.hash(PASSWORD, 10);
  const customer = await prisma.user.create({
    data: {
      email: 'cliente@localmenu.dev',
      name: 'Cliente de Exemplo',
      phone: '(11) 98888-0000',
      password,
      userType: 'CUSTOMER',
      customerProfile: { create: {} },
    },
  });

  for (const r of RESTAURANTS) {
    const owner = await prisma.user.create({
      data: {
        email: r.owner,
        name: `Dono ${r.name}`,
        password,
        userType: 'OWNER',
      },
    });
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: owner.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        phone: r.phone,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        isVerified: true,
        hours: {
          create: WEEK.map((dayOfWeek) => ({
            dayOfWeek,
            openTime: '11:00',
            closeTime: '23:00',
          })),
        },
      },
    });
    await prisma.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Cardápio Principal',
        categories: {
          create: Object.entries(r.menu).map(([name, items], order) => ({
            name,
            order: order + 1,
            items: {
              create: items.map(([itemName, price, description], i) => ({
                name: itemName,
                price,
                description,
                order: i,
              })),
            },
          })),
        },
      },
    });
  }

  // pedidos dos últimos dias na Brasa Burger, para o painel e o relatório
  const brasa = await prisma.restaurant.findUnique({
    where: { slug: 'brasa-burger' },
    include: {
      menus: { include: { categories: { include: { items: true } } } },
    },
  });
  const items = brasa.menus[0].categories.flatMap((c) => c.items);
  const pick = (name: string) => items.find((i) => i.name === name);
  const history: [
    daysAgo: number,
    status: OrderStatus,
    lines: [string, number][],
  ][] = [
    [
      6,
      OrderStatus.COMPLETED,
      [
        ['Brasa Bacon', 2],
        ['Batata rústica', 1],
      ],
    ],
    [
      5,
      OrderStatus.COMPLETED,
      [
        ['Duplo Smash', 1],
        ['Refrigerante lata', 1],
      ],
    ],
    [
      3,
      OrderStatus.COMPLETED,
      [
        ['Brasa Clássico', 1],
        ['Milk-shake de doce de leite', 1],
      ],
    ],
    [2, OrderStatus.CANCELLED, [['Veggie da Horta', 1]]],
    [
      1,
      OrderStatus.COMPLETED,
      [
        ['Brasa Bacon', 1],
        ['Onion rings', 1],
        ['Suco de laranja', 2],
      ],
    ],
    [
      0,
      OrderStatus.CONFIRMED,
      [
        ['Duplo Smash', 2],
        ['Batata rústica', 1],
      ],
    ],
  ];
  for (const [i, [daysAgo, status, lines]] of history.entries()) {
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - 3600000);
    const orderLines = lines.map(([name, quantity]) => {
      const item = pick(name);
      return {
        menuItemId: item.id,
        nameSnapshot: item.name,
        unitPrice: item.price,
        quantity,
        totalPrice: Number(item.price) * quantity,
      };
    });
    const total = orderLines.reduce((acc, l) => acc + l.totalPrice, 0);
    await prisma.order.create({
      data: {
        customerId: customer.id,
        restaurantId: brasa.id,
        orderNumber: `EX${String(i + 1).padStart(4, '0')}`,
        status,
        subtotal: total,
        total,
        createdAt,
        items: { create: orderLines },
        payment:
          status === OrderStatus.CANCELLED
            ? undefined
            : {
                create: {
                  amount: total,
                  method: PaymentMethod.PIX,
                  status: PaymentStatus.PAID,
                  paidAt: createdAt,
                  gatewayTransactionId: `simulado_seed_${i + 1}`,
                },
              },
      },
    });
  }
  await applyPhotos();
  console.log('Seed: 3 restaurantes, 4 contas e 6 pedidos de exemplo criados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
