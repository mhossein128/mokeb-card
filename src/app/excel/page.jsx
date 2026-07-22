'use client';
import React, { useState } from 'react';

export default function ExcelReader() {
  const [images, setImages] = useState([]);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const buffer = event.target.result;

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      console.log('sheets: ',workbook.worksheets)

      const worksheet = workbook.getWorksheet(1); // شیت اول

      // 🔹 log همه‌ی سلول‌ها
      worksheet.eachRow((row, rowNumber) => {
        const rowData = row.values.slice(1); // index 0 خالیه
        console.log(`row ${rowNumber}:`, rowData);
      });

      // 🔸 بررسی دسترسی به عکس‌ها
      const images = worksheet.getImages();
      console.log("📸 Images found:", images.length);

      // Get all rows data first
      const rowsData = [];
      worksheet.eachRow((row, rowNumber) => {
        rowsData[rowNumber] = row.values.slice(1); // Store row data with row number as index
      });

      const extractedImages = [];
      images.forEach((img) => {
        const imageData = workbook.getImage(img.imageId);
        const base64 = imageData.buffer.toString('base64');
        const src = `data:image/${imageData.extension};base64,${base64}`;
        
        // Get the row number where the image is located (tl = top-left cell of the image)
        const rowNumber = img.range.tl.row;
        const rowData = rowsData[rowNumber] || [];
        
        // Try to find a name in the row (assuming first column is name)
        const rowName = rowData[0] || `Row ${rowNumber}`;
        
        extractedImages.push({
          src,
          extension: imageData.extension,
          id: img.imageId,
          rowNumber,
          rowName: String(rowName),
          rowData: rowData.map(cell => String(cell || '')).filter(Boolean)
        });
        console.log(extractedImages)
      });
      setImages(extractedImages);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ textAlign: 'right', color: '#333' }}>وارد کردن فایل اکسل</h3>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept=".xlsx" 
          onChange={handleFile} 
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '400px',
            display: 'block',
            margin: '0 auto 20px'
          }}
        />
      </div>
      
      {images.length > 0 && (
        <div>
          <h4 style={{ textAlign: 'right', margin: '20px 0' }}>
            تصاویر استخراج شده: {images.length} عدد
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            padding: '10px'
          }}>
            {images.map((img, index) => (
              <div key={index} style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                },
                backgroundColor: 'white'
              }}>
                <img 
                  src={img.src} 
                  alt={`تصویر ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'contain',
                    backgroundColor: '#f9f9f9',
                    padding: '10px',
                    borderBottom: '1px solid #eee'
                  }}
                />
                <div style={{
                  padding: '10px',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderTop: '1px solid #eee',
                  fontSize: '0.9em',
                  color: '#333'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{img.rowName}</div>
                  <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
                    Row: {img.rowNumber} • {img.extension.toUpperCase()}
                  </div>
                  {img.rowData.length > 1 && (
                    <div style={{
                      fontSize: '0.75em',
                      color: '#888',
                      textAlign: 'right',
                      direction: 'rtl',
                      marginTop: '5px',
                      paddingTop: '5px',
                      borderTop: '1px dashed #ddd',
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {img.rowData.slice(1).join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
