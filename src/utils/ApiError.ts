// src/utils/ApiError.ts
// Error de negocio con código HTTP asociado. Los servicios lo lanzan y los
// controladores lo traducen a la respuesta JSON correspondiente.
export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export default ApiError;
