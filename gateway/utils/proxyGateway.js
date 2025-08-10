import { createProxyMiddleware } from "http-proxy-middleware";

function createGatewayProxy({ target, pathRewrite }) {
  //   Middleware to set header on incoming req.headers before proxying
  function setGatewayHeader(req, res, next) {
    console.log(
      `Gateway is passing the request: ${req.method} ${req.originalUrl}`
    );
    req.headers["X-From-Gateway"] = "true";
    next();
  }

  // Proxy middleware with header injection
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    logger: console,
    onProxyReq: function (proxyReq, req, res) {
      proxyReq.setHeader("X-From-Gateway", "true");

      // Optionally, you can also log the request for debugging
    },
    pathRewrite,
  });

  // Return an array of middlewares to be used in sequence
  return [setGatewayHeader, proxy];
}

export default createGatewayProxy;
