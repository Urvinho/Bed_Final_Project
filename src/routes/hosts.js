import { Router } from "express";
import auth from "../middleware/auth.js";

import getHosts from "../services/hosts/getHosts.js";
import getHostById from "../services/hosts/getHostsById.js";
import createHost from "../services/hosts/createHosts.js";
import updateHostById from "../services/hosts/updateHostsById.js";
import deleteHostById from "../services/hosts/deleteHostsById.js";

const router = Router();

router.get("/", async (req, res) => {
  const { name } = req.query;
  const hosts = await getHosts(name);
  res.json(hosts);
});

router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name) return res.status(400).json({ message: "name is required" });

    const created = await createHost(name);
    res.status(201).json(created);
  } catch (e) {
    res
      .status(400)
      .json({ message: "Could not create host", error: String(e) });
  }
});

router.get("/:id", async (req, res) => {
  const host = await getHostById(req.params.id);
  if (!host) return res.status(404).json({ message: "Host not found" });
  res.json(host);
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name) return res.status(400).json({ message: "name is required" });

    const updated = await updateHostById(req.params.id, name);
    res.json(updated);
  } catch (e) {
    res.status(404).json({ message: "Host not found", error: String(e) });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await deleteHostById(req.params.id);
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ message: "Host not found", error: String(e) });
  }
});

export default router;
