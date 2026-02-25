/**
 * Auth Error Message Mapping
 * Maps HTTP status codes and error details to user-friendly messages
 */

interface ErrorObject {
  status?: number;
  response?: { status?: number; data?: { detail?: string } };
  detail?: string;
  message?: string;
}

function isErrorObject(error: unknown): error is ErrorObject {
  return typeof error === "object" && error !== null;
}

export function getAuthErrorMessage(error: unknown): string {
  // Handle Error instances (including APIError)
  if (error instanceof Error) {
    return error.message || "An error occurred";
  }
  
  if (!isErrorObject(error)) {
    return String(error);
  }
  
  const status = error?.status || error?.response?.status;
  const detail = error?.detail || error?.response?.data?.detail || error?.message || "";

  // Handle different error types
  if (typeof error === "string") {
    return mapErrorDetail(error);
  }

  // Map by HTTP status code
  switch (status) {
    case 400:
      return "Invalid input. Please check your entries.";

    case 401:
      return "Invalid email or password";

    case 404:
      return "Account not found. Create an account?";

    case 409:
      return "Email already in use. Try logging in.";

    case 422:
      return mapValidationError(detail);

    case 500:
      return "Server error. Please try again later.";

    default:
      return mapErrorDetail(detail) || "An error occurred. Please try again.";
  }
}

function mapValidationError(detail: string): string {
  if (!detail) return "Invalid data. Please check your entries.";

  const detailStr = String(detail).toLowerCase();

  if (detailStr.includes("password")) {
    return "Password must be at least 8 characters.";
  }
  if (detailStr.includes("email")) {
    return "Invalid email format.";
  }
  if (detailStr.includes("required")) {
    return "Please fill in all required fields.";
  }

  return "Invalid data. Please check your entries.";
}

function mapErrorDetail(detail: unknown): string {
  if (!detail) return "";

  const detailStr = String(detail).toLowerCase();

  if (detailStr.includes("not found")) {
    return "Account not found. Create an account?";
  }
  if (detailStr.includes("already exists")) {
    return "Email already in use. Try logging in.";
  }
  if (detailStr.includes("invalid")) {
    return "Invalid email or password";
  }
  if (detailStr.includes("expired")) {
    return "Your session expired. Please log in again.";
  }

  return String(detail);
}

/**
 * Handle network errors (timeouts, connection issues)
 */
export function getNetworkErrorMessage(error: unknown): string {
  let message = "";
  if (isErrorObject(error) && error.message) {
    message = String(error.message).toLowerCase();
  } else if (error instanceof Error) {
    message = error.message.toLowerCase();
  } else {
    message = String(error || "").toLowerCase();
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "Connection lost. Check your internet.";
  }
  if (message.includes("timeout")) {
    return "Request took too long. Try again.";
  }

  return "Connection error. Please try again.";
}
