import { Router } from "express";

interface Controller {
  paths: string;
  router: Router;
}

export default Controller;
