import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  async generateTeardownReport(benchmarkId: string) {
    const benchmark = await prisma.benchmark.findUnique({
      where: { id: benchmarkId },
      include: {
        components: true,
        bomItems: true,
        images: true,
        project: true,
      },
    });

    if (!benchmark) throw new Error('Benchmark not found');

    // Generate HTML content for PDF
    const htmlContent = this.generateTeardownHTML(benchmark);
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(__dirname, '../../uploads/reports', `teardown-${benchmarkId}-${Date.now()}.pdf`);
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
    
    await browser.close();

    // Save report record
    const report = await prisma.report.create({
      data: {
        projectId: benchmark.projectId,
        createdBy: benchmark.project.createdBy,
        title: `Teardown Report - ${benchmark.productName}`,
        type: 'TEARDOWN',
        content: benchmark,
        pdfUrl: `/uploads/reports/${path.basename(pdfPath)}`,
      },
    });

    return report;
  }

  private generateTeardownHTML(benchmark: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { background: #1e40af; color: white; padding: 20px; margin: -40px -40px 30px -40px; }
          .section { margin-bottom: 30px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .metric { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background: #f9fafb; font-weight: 600; }
          .bom-total { background: #fef3c7; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TEARDOWN ANALYSIS REPORT</h1>
          <p>${benchmark.productName} | ${benchmark.manufacturer} | ${benchmark.modelNumber || 'N/A'}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="grid">
            <div class="metric">
              <div class="metric-label">Estimated Cost</div>
              <div class="metric-value">$${benchmark.estimatedCost?.toLocaleString() || 'N/A'}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Total Weight</div>
              <div class="metric-value">${benchmark.weight?.toFixed(2) || 'N/A'} kg</div>
            </div>
            <div class="metric">
              <div class="metric-label">Quality Score</div>
              <div class="metric-value">${benchmark.qualityScore || 'N/A'}/10</div>
            </div>
            <div class="metric">
              <div class="metric-label">Components</div>
              <div class="metric-value">${benchmark.components.length}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Bill of Materials</h2>
          <table>
            <thead>
              <tr>
                <th>Item #</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Material</th>
                <th>Weight (kg)</th>
                <th>Cost (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${benchmark.bomItems.map((item: any) => `
                <tr>
                  <td>${item.itemNumber}</td>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.material || '-'}</td>
                  <td>${item.weight?.toFixed(3) || '-'}</td>
                  <td>$${item.cost?.toFixed(2) || '-'}</td>
                </tr>
              `).join('')}
              <tr class="bom-total">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td>${benchmark.bomItems.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0).toFixed(3)} kg</td>
                <td>$${benchmark.bomItems.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0), 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Key Components Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Material</th>
                <th>Function</th>
                <th>Cost</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${benchmark.components.map((comp: any) => `
                <tr>
                  <td>${comp.name}</td>
                  <td>${comp.material || '-'}</td>
                  <td>${comp.function || '-'}</td>
                  <td>$${comp.cost?.toFixed(2) || '-'}</td>
                  <td>${comp.isProprietary ? 'Proprietary' : 'Standard'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Manufacturing Insights</h2>
          <p><strong>Assembly Time:</strong> ${benchmark.assemblyTime || 'N/A'} minutes</p>
          <p><strong>DFMA Score:</strong> ${benchmark.dfmaScore || 'N/A'}/10</p>
          <p><strong>Make vs Buy Decision:</strong> ${benchmark.makeVsBuy || 'Not specified'}</p>
          <p><strong>Recommendations:</strong> ${benchmark.recommendations || 'None recorded'}</p>
        </div>

        <div style="margin-top: 50px; font-size: 10px; color: #9ca3af; text-align: center;">
          Generated by ADVIK Benchmarking System | ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  }
}