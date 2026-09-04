var express = require("express");
var router = express.Router();
const Project = require("../models/project");

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/sitemap.xml", async function (req, res, next) {
  try {
    const base = (process.env.SITE_URL || req.protocol + "://" + req.get("host")).replace(/\/$/, "");

    const staticUrls = ["/", "/categories", "/marketplace", "/login", "/register"];

    const projects = await Project.find({ published: true })
      .select("_id createdAt")
      .sort({ createdAt: -1 });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const path of staticUrls) {
      xml += "  <url>\n";
      xml += "    <loc>" + esc(base + path) + "</loc>\n";
      xml += "  </url>\n";
    }

    for (const project of projects) {
      xml += "  <url>\n";
      xml += "    <loc>" + esc(base + "/projects/" + project._id) + "</loc>\n";
      if (project.createdAt) {
        xml += "    <lastmod>" + new Date(project.createdAt).toISOString() + "</lastmod>\n";
      }
      xml += "  </url>\n";
    }

    xml += "</urlset>";

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
