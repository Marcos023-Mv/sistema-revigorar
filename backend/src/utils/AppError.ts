export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(msg: string) { return new AppError(msg, 400); }
  static unauthorized(msg = 'Não autorizado') { return new AppError(msg, 401); }
  static forbidden(msg = 'Acesso negado') { return new AppError(msg, 403); }
  static notFound(msg = 'Recurso não encontrado') { return new AppError(msg, 404); }
  static conflict(msg: string) { return new AppError(msg, 409); }
  static internal(msg = 'Erro interno') { return new AppError(msg, 500, false); }
}
