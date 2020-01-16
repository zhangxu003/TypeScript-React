import { Request, Response } from 'express';

export default {
  'Get  /api/dict/data-codes': (req: Request, res: Response) => {
    res.status(200).json({
      responseCode: '200',
      data: [],
    });
  },
};
