let _app = null;

async function getApp() {
  if (!_app) {
    const mod = await import("../artifacts/api-server/dist/app.mjs");
    _app = mod.default;
  }
  return _app;
}

module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};
