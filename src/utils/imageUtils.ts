// 图片处理工具

export class ImageUtils {
  // 读取文件为DataURL
  static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (e) => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsDataURL(file);
    });
  }
  
  // 压缩图片
  static async compressImage(
    file: File, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 计算新尺寸
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  // 裁剪图片
  static async cropImage(
    imageSrc: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        
        // 裁剪图片
        ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);
        
        // 返回裁剪后的图片数据
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('图片裁剪失败'));
      };
      
      img.src = imageSrc;
    });
  }

  // 旋转图片
  static async rotateImage(imageSrc: string, degrees: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const radians = (degrees * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        
        // 计算旋转后的canvas尺寸
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 移动到中心点
        ctx?.translate(newWidth / 2, newHeight / 2);
        
        // 旋转
        ctx?.rotate(radians);
        
        // 绘制图片
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('图片旋转失败'));
      };
      
      img.src = imageSrc;
    });
  }

  // 调整图片亮度
  static async adjustBrightness(imageSrc: string, brightness: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制原图
        ctx?.drawImage(img, 0, 0);
        
        // 获取图片数据
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('无法获取图片数据'));
          return;
        }
        
        const data = imageData.data;
        
        // 调整亮度
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + brightness));     // R
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness)); // G
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness)); // B
        }
        
        // 应用修改
        ctx?.putImageData(imageData, 0, 0);
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('图片亮度调整失败'));
      };
      
      img.src = imageSrc;
    });
  }

  // 调整图片对比度
  static async adjustContrast(imageSrc: string, contrast: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('无法获取图片数据'));
          return;
        }
        
        const data = imageData.data;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        // 调整对比度
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        
        ctx?.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('图片对比度调整失败'));
      };
      
      img.src = imageSrc;
    });
  }

  // 应用灰度滤镜
  static async applyGrayscale(imageSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('无法获取图片数据'));
          return;
        }
        
        const data = imageData.data;
        
        // 转换为灰度
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;     // R
          data[i + 1] = gray; // G
          data[i + 2] = gray; // B
        }
        
        ctx?.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('灰度滤镜应用失败'));
      };
      
      img.src = imageSrc;
    });
  }

  // 应用复古滤镜
  static async applySepia(imageSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('无法获取图片数据'));
          return;
        }
        
        const data = imageData.data;
        
        // 应用复古效果
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        
        ctx?.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('复古滤镜应用失败'));
      };
      
      img.src = imageSrc;
    });
  }

  // 获取图片的自然尺寸
  static getImageDimensions(imageSrc: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        reject(new Error('无法获取图片尺寸'));
      };
      
      img.src = imageSrc;
    });
  }
  
  // 验证图片文件
  static validateImageFile(file: File): { valid: boolean; message: string } {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: '只支持 JPG、PNG、GIF 格式的图片'
      };
    }
    
    // 检查文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        message: '图片大小不能超过 10MB'
      };
    }
    
    return {
      valid: true,
      message: '图片验证通过'
    };
  }
}
