import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class PDFGenerator {
  // 导出为PDF
  static async exportToPDF(elementId: string, filename: string = 'photo-book.pdf'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('找不到指定的元素');
      }
      
      // 等待所有图片加载完成
      await this.waitForImages(element);
      
      // 等待字体加载完成
      await document.fonts.ready;
      
      // 使用html2canvas将DOM转换为canvas
      const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true, // 处理跨域图片
        logging: false, // 禁用日志
        backgroundColor: '#ffffff', // 设置背景色
        allowTaint: true, // 允许跨域图片
        foreignObjectRendering: true // 支持外部对象渲染
      });
      
      // 使用jspdf将canvas转换为PDF
      const imgData = canvas.toDataURL('image/png');
      
      // 计算PDF尺寸 - 根据canvas的宽高比来决定PDF的方向和尺寸
      const canvasAspectRatio = canvas.width / canvas.height;
      let pdfWidth: number, pdfHeight: number, orientation: 'p' | 'l';
      
      if (canvasAspectRatio > 1) {
        // 横向
        orientation = 'l';
        pdfWidth = 297; // A4横向宽度
        pdfHeight = 210; // A4横向高度
      } else {
        // 纵向
        orientation = 'p';
        pdfWidth = 210; // A4纵向宽度
        pdfHeight = 297; // A4纵向高度
      }
      
      const pdf = new jsPDF(orientation, 'mm', 'a4');
      
      // 计算图片在PDF中的尺寸，保持宽高比
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // 如果图片高度超过页面高度，需要分页
      if (imgHeight <= pdfHeight) {
        // 单页可以容纳
        const yPosition = (pdfHeight - imgHeight) / 2; // 垂直居中
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
      } else {
        // 需要分页
        let remainingHeight = imgHeight;
        let isFirstPage = true;
        
        while (remainingHeight > 0) {
          if (!isFirstPage) {
            pdf.addPage();
          }
          
          const pageHeight = Math.min(remainingHeight, pdfHeight);
          const sourceY = (imgHeight - remainingHeight) * (canvas.height / imgHeight);
          const sourceHeight = pageHeight * (canvas.height / imgHeight);
          
          // 创建临时canvas来裁剪当前页面的内容
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          const img = new Image();
          img.src = imgData;
          await new Promise((resolve) => {
            img.onload = () => {
              tempCtx?.drawImage(img, 0, -sourceY);
              const pageImgData = tempCanvas.toDataURL('image/png');
              pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, pageHeight);
              resolve(null);
            };
          });
          
          remainingHeight -= pageHeight;
          isFirstPage = false;
        }
      }
      
      // 保存PDF
      pdf.save(filename);
      
      console.log(`PDF导出成功: ${filename}`);
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error}`);
    }
  }
  
  // 导出多页PDF（用于照片书的多个页面）
  static async exportMultiPageToPDF(pageElements: string[], filename: string = 'photo-book.pdf'): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;
      
      for (const elementId of pageElements) {
        const element = document.getElementById(elementId);
        if (!element) {
          console.warn(`跳过未找到的元素: ${elementId}`);
          continue;
        }
        
        // 等待图片加载
        await this.waitForImages(element);
        
        // 生成canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        });
        
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        // 将页面内容添加到PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4宽度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // 如果页面内容太高，进行缩放以适应页面
        if (imgHeight > 297) {
          const scaledHeight = 297;
          const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
          const xOffset = (210 - scaledWidth) / 2;
          pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
        } else {
          const yOffset = (297 - imgHeight) / 2;
          pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
        }
        
        isFirstPage = false;
      }
      
      pdf.save(filename);
      console.log(`多页PDF导出成功: ${filename}`);
    } catch (error) {
      console.error('多页PDF导出失败:', error);
      throw new Error(`多页PDF导出失败: ${error}`);
    }
  }
  
  // 等待所有图片加载完成
  private static async waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    if (images.length === 0) return;
    
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = images.length;
      
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve();
        }
      };
      
      images.forEach(img => {
        if (img.complete && img.naturalHeight !== 0) {
          checkAllLoaded();
        } else {
          img.onload = checkAllLoaded;
          img.onerror = () => {
            console.warn('图片加载失败，继续导出:', img.src);
            checkAllLoaded(); // 即使失败也继续
          };
        }
      });
      
      // 设置超时
      setTimeout(() => {
        if (loadedCount < totalImages) {
          console.warn(`部分图片加载超时 (${loadedCount}/${totalImages})，继续导出`);
          resolve();
        }
      }, 5000);
    });
  }
  
  // 预览PDF内容（返回blob URL）
  static async previewPDF(elementId: string): Promise<string> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('找不到指定的元素');
      }
      
      await this.waitForImages(element);
      await document.fonts.ready;
      
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (imgHeight <= 297) {
        const yPosition = (297 - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
      } else {
        const scaledHeight = 297;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        const xOffset = (210 - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
      }
      
      return pdf.output('bloburl');
    } catch (error) {
      console.error('PDF预览失败:', error);
      throw new Error(`PDF预览失败: ${error}`);
    }
  }
}
