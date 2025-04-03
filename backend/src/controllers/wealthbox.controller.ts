import { Request, Response } from 'express';
import { wealthboxService } from '../services/wealthbox.service';

export class WealthboxController {
  async getContacts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 100;
      
      const contacts = await wealthboxService.fetchContacts(page, perPage);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllContacts(req: Request, res: Response) {
    try {
      const contacts = await wealthboxService.fetchAllContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getContact(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contact = await wealthboxService.getContact(parseInt(id));
      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await wealthboxService.getTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await wealthboxService.getTask(parseInt(id));
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const events = await wealthboxService.getEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await wealthboxService.getEvent(parseInt(id));
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const wealthboxController = new WealthboxController(); 