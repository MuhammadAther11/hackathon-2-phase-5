// This route is not needed - we're using backend auth endpoints directly
// Auth is handled via FastAPI backend at /auth/login and /auth/signup

export async function GET() {
  return Response.json({ error: "Auth endpoints are on the backend" }, { status: 404 });
}

export async function POST() {
  return Response.json({ error: "Auth endpoints are on the backend" }, { status: 404 });
}
