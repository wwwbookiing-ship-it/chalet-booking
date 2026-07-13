export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Worker is running"
        }),
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8"
          }
        }
      );
    }

    return new Response("Chalet Booking Worker is running", {
      headers: {
        "Content-Type": "text/plain; charset=UTF-8"
      }
    });
  }
};
