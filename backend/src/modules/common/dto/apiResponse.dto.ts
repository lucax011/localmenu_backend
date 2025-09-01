// common/dto/api-response.dto.ts

/**
 * Generic API response DTO for standardizing server responses.
 * @template T - The type of the data returned in the response.
 * @property success - Indicates if the request was successful.
 * @property data - The payload returned from the API. Present when the request is successful and contains data of type T.
 * @property message - Optional message describing the response; can be used for informational or error messages.
 * @property errors - Optional array of error messages.
 * @property pagination - Present only for paginated responses; contains pagination details:
 *   - page: The current page number.
 *   - limit: The number of items per page.
 *   - total: The total number of items available.
 *   - totalPages: The total number of pages available.
 */
export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
