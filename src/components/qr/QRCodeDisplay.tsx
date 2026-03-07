import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent } from '../ui/Card';
import type { Worker } from '../../types/database';

interface QRCodeDisplayProps {
  worker: Worker;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  worker,
  size = 200,
}) => {
  return (
    <Card className="inline-block">
      <CardContent className="text-center p-6">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          <QRCode value={worker.qr_code} size={size} />
        </div>
        <h3 className="font-semibold text-gray-900">{worker.full_name}</h3>
        <p className="text-sm text-gray-500">ID: {worker.employee_id}</p>
      </CardContent>
    </Card>
  );
};
