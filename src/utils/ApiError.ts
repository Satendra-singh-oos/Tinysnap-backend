class ApiError {
  statusCode: number;
  data: null;
  success: boolean;
  errors: any[];
  message: string;

  constructor(
    statusCode: number,
    message: string = "Something Went Wrong",
    errors: any[] = []
  ) {
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
  }
}

export { ApiError };
