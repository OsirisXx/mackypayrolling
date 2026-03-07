import React, { useEffect, useState, useRef } from 'react';
import { Printer, Search, Download, DownloadCloud } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useWorkerStore } from '../stores/workerStore';
import type { Worker } from '../types/database';

export const QRCodesPage: React.FC = () => {
  const { workers, fetchWorkers } = useWorkerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const activeWorkers = workers.filter((w) => w.is_active);
  const filteredWorkers = activeWorkers.filter(
    (w) =>
      w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleWorker = (id: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedWorkers(filteredWorkers.map((w) => w.id));
  };

  const deselectAll = () => {
    setSelectedWorkers([]);
  };

  const downloadQRCode = async (worker: Worker) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(worker.qr_code)}&margin=10&format=png`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${worker.employee_id}_${worker.full_name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const downloadSelectedQRCodes = async () => {
    const selectedWorkersData = workers.filter((w) => selectedWorkers.includes(w.id));
    
    if (selectedWorkersData.length === 0) {
      alert('Please select at least one worker');
      return;
    }

    // Download each QR code with a small delay to avoid overwhelming the browser
    for (let i = 0; i < selectedWorkersData.length; i++) {
      await downloadQRCode(selectedWorkersData[i]);
      // Small delay between downloads
      if (i < selectedWorkersData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  const handlePrint = async () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const selectedWorkersData = workers.filter((w) => selectedWorkers.includes(w.id));
    
    // Generate QR codes as data URLs using Google Charts API (no external library needed)
    const qrDataUrls = await Promise.all(
      selectedWorkersData.map(async (worker) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(worker.qr_code)}&margin=10`;
        return {
          id: worker.id,
          url: qrUrl,
          name: worker.full_name,
          employeeId: worker.employee_id,
        };
      })
    );

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - Macrock Limestone</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 10mm;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header p {
              font-size: 14px;
              color: #666;
            }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 15mm;
              margin-top: 20px;
            }
            .card { 
              border: 2px solid #333;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              break-inside: avoid;
              page-break-inside: avoid;
              background: white;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 12px;
              background: white;
              padding: 10px;
              min-height: 200px;
            }
            .qr-container img {
              max-width: 180px;
              height: auto;
            }
            .name { 
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 4px;
              color: #000;
            }
            .id { 
              color: #666;
              font-size: 13px;
              font-weight: 500;
            }
            @media print {
              body {
                padding: 5mm;
              }
              .header {
                display: none;
              }
              .grid { 
                grid-template-columns: repeat(3, 1fr);
                gap: 10mm;
              }
              .card { 
                page-break-inside: avoid;
                break-inside: avoid;
              }
              @page {
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Macrock Limestone</h1>
            <p>Worker QR Codes</p>
          </div>
          <div class="grid">
            ${qrDataUrls
              .map(
                (qr) => `
              <div class="card">
                <div class="qr-container">
                  <img src="${qr.url}" alt="QR Code for ${qr.employeeId}" crossorigin="anonymous" />
                </div>
                <div class="name">${qr.name}</div>
                <div class="id">${qr.employeeId}</div>
              </div>
            `
              )
              .join('')}
          </div>
          <script>
            // Wait for all images to load before printing
            const images = document.querySelectorAll('img');
            let loadedCount = 0;
            const totalImages = images.length;
            
            console.log('Waiting for ' + totalImages + ' QR code images to load...');
            
            if (totalImages === 0) {
              console.log('No images to load, printing immediately');
              setTimeout(() => window.print(), 500);
            } else {
              images.forEach((img, index) => {
                if (img.complete) {
                  loadedCount++;
                  console.log('Image ' + (index + 1) + ' already loaded');
                  if (loadedCount === totalImages) {
                    console.log('All images loaded, printing...');
                    setTimeout(() => window.print(), 500);
                  }
                } else {
                  img.onload = () => {
                    loadedCount++;
                    console.log('Image ' + (index + 1) + ' loaded (' + loadedCount + '/' + totalImages + ')');
                    if (loadedCount === totalImages) {
                      console.log('All images loaded, printing...');
                      setTimeout(() => window.print(), 500);
                    }
                  };
                  img.onerror = () => {
                    loadedCount++;
                    console.error('Image ' + (index + 1) + ' failed to load');
                    if (loadedCount === totalImages) {
                      console.log('All images processed (some failed), printing...');
                      setTimeout(() => window.print(), 500);
                    }
                  };
                }
              });
              
              // Timeout fallback
              setTimeout(() => {
                if (loadedCount < totalImages) {
                  console.warn('Timeout: Only ' + loadedCount + '/' + totalImages + ' images loaded, printing anyway...');
                  window.print();
                }
              }, 10000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-500">Generate and print worker QR codes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={downloadSelectedQRCodes} 
            disabled={selectedWorkers.length === 0}
            variant="outline"
          >
            <DownloadCloud className="w-4 h-4 mr-2" />
            Download Selected ({selectedWorkers.length})
          </Button>
          <Button onClick={handlePrint} disabled={selectedWorkers.length === 0}>
            <Printer className="w-4 h-4 mr-2" />
            Print Selected ({selectedWorkers.length})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className={`p-4 border-2 rounded-xl transition-all relative group ${
                  selectedWorkers.includes(worker.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div 
                  onClick={() => toggleWorker(worker.id)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-3 rounded-lg">
                      <QRCode value={worker.qr_code} size={120} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{worker.full_name}</p>
                    <p className="text-sm text-gray-500">ID: {worker.employee_id}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadQRCode(worker);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                  title="Download QR Code"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
