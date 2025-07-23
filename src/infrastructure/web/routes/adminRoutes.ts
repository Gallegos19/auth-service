import { Router } from "express";
import { AdminUserController } from "../controllers/AdminUserController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { rateLimitMiddleware } from "../middleware/rateLimitMiddleware";

export function createAdminRoutes(
  adminUserController: AdminUserController
): Router {
  const router = Router();

  // Middleware global para todas las rutas administrativas
  router.use(authMiddleware); // Requiere autenticación
  router.use(roleMiddleware(["administrator"])); // Solo administradores

  // ==================
  // MODERATOR ROUTES
  // ==================

  /**
   * @swagger
   * tags:
   *   - name: Administración - Moderadores
   *     description: Gestión CRUD de moderadores (solo administradores)
   */

  // CREATE - Crear moderador
  router.post(
    "/moderators",
    rateLimitMiddleware(5, 60), // 5 creaciones por hora
    async (req, res) => {
      try {
        await adminUserController.createModerator(req, res);
      } catch (error) {
        console.error("❌ Error en ruta POST /admin/moderators:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // READ - Listar moderadores
  router.get(
    "/moderators",
    rateLimitMiddleware(50, 15), // 50 consultas por 15 minutos
    async (req, res) => {
      try {
        await adminUserController.listModerators(req, res);
      } catch (error) {
        console.error("❌ Error en ruta GET /admin/moderators:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // READ - Obtener moderador por ID
  router.get(
    "/moderators/:id",
    rateLimitMiddleware(100, 15), // 100 consultas por 15 minutos
    async (req, res) => {
      try {
        await adminUserController.getModerator(req, res);
      } catch (error) {
        console.error("❌ Error en ruta GET /admin/moderators/:id:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // UPDATE - Actualizar moderador
  router.put(
    "/moderators/:id",
    rateLimitMiddleware(20, 60), // 20 actualizaciones por hora
    async (req, res) => {
      try {
        await adminUserController.updateModerator(req, res);
      } catch (error) {
        console.error("❌ Error en ruta PUT /admin/moderators/:id:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // DELETE - Desactivar moderador
  router.post(
    "/moderators/:id/deactivate",
    rateLimitMiddleware(10, 60), // 10 desactivaciones por hora
    async (req, res) => {
      try {
        await adminUserController.deactivateModerator(req, res);
      } catch (error) {
        console.error(
          "❌ Error en ruta POST /admin/moderators/:id/deactivate:",
          error
        );
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // ==================
  // ADMINISTRATOR ROUTES
  // ==================

  /**
   * @swagger
   * tags:
   *   - name: Administración - Administradores
   *     description: Gestión CRUD de administradores (solo administradores)
   */

  // CREATE - Crear administrador
  router.post(
    "/administrators",
    rateLimitMiddleware(3, 60), // 3 creaciones por hora (más restrictivo)
    async (req, res) => {
      try {
        await adminUserController.createAdministrator(req, res);
      } catch (error) {
        console.error("❌ Error en ruta POST /admin/administrators:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // READ - Listar administradores
  router.get(
    "/administrators",
    rateLimitMiddleware(50, 15), // 50 consultas por 15 minutos
    async (req, res) => {
      try {
        await adminUserController.listAdministrators(req, res);
      } catch (error) {
        console.error("❌ Error en ruta GET /admin/administrators:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // READ - Obtener administrador por ID
  router.get(
    "/administrators/:id",
    rateLimitMiddleware(100, 15), // 100 consultas por 15 minutos
    async (req, res) => {
      try {
        await adminUserController.getAdministrator(req, res);
      } catch (error) {
        console.error("❌ Error en ruta GET /admin/administrators/:id:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // UPDATE - Actualizar administrador
  router.put(
    "/administrators/:id",
    rateLimitMiddleware(20, 60), // 20 actualizaciones por hora
    async (req, res) => {
      try {
        await adminUserController.updateAdministrator(req, res);
      } catch (error) {
        console.error("❌ Error en ruta PUT /admin/administrators/:id:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // DELETE - Desactivar administrador
  router.post(
    "/administrators/:id/deactivate",
    rateLimitMiddleware(5, 60), // 5 desactivaciones por hora (muy restrictivo)
    async (req, res) => {
      try {
        await adminUserController.deactivateAdministrator(req, res);
      } catch (error) {
        console.error(
          "❌ Error en ruta POST /admin/administrators/:id/deactivate:",
          error
        );
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  return router;
}
