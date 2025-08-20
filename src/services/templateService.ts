import type { Template } from '../types/template';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟模板数据
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: '经典相册',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiLz4KPHJlY3QgeD0iMTEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSI3MCIgaGVpZ2h0PSI1MCI+CjxjaXJjbGUgY3g9IjM1IiBjeT0iMjAiIHI9IjgiIGZpbGw9IiNGRkRCNEQiLz4KPHN2ZyB4PSIyMCIgeT0iMzUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4Ij4KPHBhdGggZD0iTTAgOEw2MCA4TDQ1IDBMMTU1IDBMMC4wODA4WiIgZmlsbD0iIzY2Nzg0QSIvPgo8L3N2Zz4KPC9zdmc+CjxyZWN0IHg9IjEwIiB5PSI4MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjRDFENURCIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2RjZGNkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuaNoOS7tuagt+mimDwvdGV4dD4KPC9zdmc+',
    pages: [
      {
        id: 'page-1-1',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-1-1',
            x: 50,
            y: 50,
            width: 300,
            height: 200,
            placeholder: '点击添加照片'
          },
          {
            id: 'photo-frame-1-2',
            x: 450,
            y: 50,
            width: 300,
            height: 200,
            placeholder: '点击添加照片'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-1-1',
            x: 50,
            y: 300,
            width: 700,
            height: 80,
            placeholder: '添加标题'
          }
        ]
      },
      {
        id: 'page-1-2',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-1-3',
            x: 200,
            y: 80,
            width: 400,
            height: 300,
            placeholder: '点击添加照片'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-1-2',
            x: 50,
            y: 420,
            width: 700,
            height: 60,
            placeholder: '添加描述文字'
          }
        ]
      }
    ]
  },
  {
    id: 'template-2',
    name: '现代风格',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGMUYzRjQiIHN0cm9rZT0iIzlDQTNBRiIvPgo8cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSI2MCIgeT0iNTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCI+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTIiIHI9IjYiIGZpbGw9IiNGRkRCNEQiLz4KPHN2ZyB4PSIzMCIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI2Ij4KPHBhdGggZD0iTTAgNkw1MCA2TDQwIDBMMTAgMEwwLjEgNloiIGZpbGw9IiM2Njc4NEEiLz4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+',
    pages: [
      {
        id: 'page-2-1',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-2-1',
            x: 100,
            y: 100,
            width: 600,
            height: 400,
            placeholder: '点击添加照片'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-2-1',
            x: 100,
            y: 40,
            width: 600,
            height: 50,
            placeholder: '添加标题'
          },
          {
            id: 'text-frame-2-2',
            x: 100,
            y: 520,
            width: 600,
            height: 50,
            placeholder: '添加描述'
          }
        ]
      }
    ]
  },
  {
    id: 'template-3',
    name: '旅行日记',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkZGN0VEIi8+CjxyZWN0IHg9IjEwIiB5PSI0MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI3MCIgZmlsbD0iI0U1RTdFQiIgc3Ryb2tlPSIjQzVDN0NCIi8+CjxyZWN0IHg9IjEyMCIgeT0iMjAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI0U1RTdFQiIgc3Ryb2tlPSIjQzVDN0NCIi8+CjxyZWN0IHg9IjEyMCIgeT0iODAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI0U1RTdFQiIgc3Ryb2tlPSIjQzVDN0NCIi8+CjxyZWN0IHg9IjEwIiB5PSIxMjAiIHdpZHRoPSIxODAiIGhlaWdodD0iMjAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0Q5REJERiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEzMiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjc3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7ml4XooYzml6XorrA8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NEZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VHJhdmVsIERpYXJ5PC90ZXh0Pgo8L3N2Zz4=',
    pages: [
      {
        id: 'page-3-1',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-3-1',
            x: 50,
            y: 100,
            width: 350,
            height: 250,
            placeholder: '主要照片'
          },
          {
            id: 'photo-frame-3-2',
            x: 450,
            y: 80,
            width: 200,
            height: 150,
            placeholder: '小照片1'
          },
          {
            id: 'photo-frame-3-3',
            x: 450,
            y: 260,
            width: 200,
            height: 150,
            placeholder: '小照片2'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-3-1',
            x: 50,
            y: 30,
            width: 700,
            height: 50,
            placeholder: '旅行标题'
          },
          {
            id: 'text-frame-3-2',
            x: 50,
            y: 380,
            width: 350,
            height: 150,
            placeholder: '记录你的旅行故事...'
          },
          {
            id: 'text-frame-3-3',
            x: 450,
            y: 430,
            width: 200,
            height: 100,
            placeholder: '日期和地点'
          }
        ]
      }
    ]
  },
  {
    id: 'template-4',
    name: '家庭相册',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkVGMkY5Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGM0ZGIiBzdHJva2U9IiNEOUQ0RjAiLz4KPHJlY3QgeD0iODAiIHk9IjEwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGNUYzRkYiIHN0cm9rZT0iI0Q5RDRGMCIvPgo8cmVjdCB4PSIxNTAiIHk9IjEwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGNUYzRkYiIHN0cm9rZT0iI0Q5RDRGMCIvPgo8cmVjdCB4PSIxMCIgeT0iNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0Y1RjNGRiIgc3Ryb2tlPSIjRDlENEYwIi8+CjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGM0ZGIiBzdHJva2U9IiNEOUQ0RjAiLz4KPHJlY3QgeD0iMTUwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGM0ZGIiBzdHJva2U9IiNEOUQ0RjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjE1IiBjeT0iOCIgcj0iMyIgZmlsbD0iI0ZGREJCNCIvPgo8L3N2Zz4KPHN2ZyB4PSI5NSIgeT0iMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjE1IiBjeT0iOCIgcj0iMyIgZmlsbD0iI0ZGREJCNCIvPgo8L3N2Zz4KPHN2ZyB4PSIxNjUiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIzIiBmaWxsPSIjRkZEQkI0Ii8+CjwvdGV4dD4KPHN2ZyB4PSIyNSIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjMiIGZpbGw9IiNGRkRCQjQiLz4KPC90ZXh0Pgo8c3ZnIHg9Ijg1IiB5PSI3MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjIwIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIxMCIgcj0iMyIgZmlsbD0iI0ZGREJCNCIvPgo8L3N2Zz4KPHN2ZyB4PSIxNjUiIHk9IjcwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIzIiBmaWxsPSIjRkZEQkI0Ii8+CjwvdGV4dD4KPHR4dCB4PSIxMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNzU0NEVBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lrrblupDnm7jlhbA8L3RleHQ+Cjwvc3ZnPg==',
    pages: [
      {
        id: 'page-4-1',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-4-1',
            x: 50,
            y: 50,
            width: 200,
            height: 150,
            placeholder: '家庭照片1'
          },
          {
            id: 'photo-frame-4-2',
            x: 300,
            y: 50,
            width: 200,
            height: 150,
            placeholder: '家庭照片2'
          },
          {
            id: 'photo-frame-4-3',
            x: 550,
            y: 50,
            width: 150,
            height: 150,
            placeholder: '小照片'
          },
          {
            id: 'photo-frame-4-4',
            x: 50,
            y: 250,
            width: 150,
            height: 150,
            placeholder: '小照片'
          },
          {
            id: 'photo-frame-4-5',
            x: 250,
            y: 250,
            width: 300,
            height: 150,
            placeholder: '合影'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-4-1',
            x: 50,
            y: 10,
            width: 650,
            height: 30,
            placeholder: '家庭相册标题'
          },
          {
            id: 'text-frame-4-2',
            x: 50,
            y: 450,
            width: 650,
            height: 100,
            placeholder: '记录家庭的美好时光...'
          }
        ]
      }
    ]
  },
  {
    id: 'template-5',
    name: '婚礼纪念',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkJGNkY4Ii8+CjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI5MCIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjRTk5NkE3Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjQwIiByPSI4IiBmaWxsPSIjRkY5NEExIi8+CjxyZWN0IHg9IjUwIiB5PSI2MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI1MCIgZmlsbD0iI0Y3RjBGNSIgc3Ryb2tlPSIjRTk5NkE3Ii8+CjxzdmcgeD0iODAiIHk9IjcwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjE1IiByPSI1IiBmaWxsPSIjRkZEQkI0Ii8+CjxzdmcgeD0iMTAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iNSI+CjxwYXRoIGQ9Ik0wIDVMMjAgNUwxNSAwTDUgMEwwLjEgNVoiIGZpbGw9IiM2Njc4NEEiLz4KPC9zdmc+CjwvdGV4dD4KPHBvbHlnb24gcG9pbnRzPSI4NSw1IDk1LDEwIDEwNSw1IDk1LDAgODUsNSIgZmlsbD0iI0ZGOTRBMSIvPgo8cG9seWdvbiBwb2ludHM9IjExNSw1IDEyNSwxMCAxMzUsNSAxMjUsMCAxMTUsNSIgZmlsbD0iI0ZGOTRBMSIvPgo8dGV4dCB4PSIxMDAiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRTk5NkE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lqZrneK3nu6bolvE8L3RleHQ+Cjwvc3ZnPg==',
    pages: [
      {
        id: 'page-5-1',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-5-1',
            x: 200,
            y: 100,
            width: 400,
            height: 300,
            placeholder: '婚礼主照'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-5-1',
            x: 150,
            y: 30,
            width: 500,
            height: 60,
            placeholder: '爱的见证'
          },
          {
            id: 'text-frame-5-2',
            x: 200,
            y: 420,
            width: 400,
            height: 80,
            placeholder: '永恒的誓言'
          }
        ]
      },
      {
        id: 'page-5-2',
        width: 800,
        height: 600,
        photoFrames: [
          {
            id: 'photo-frame-5-3',
            x: 50,
            y: 50,
            width: 200,
            height: 200,
            placeholder: '仪式照'
          },
          {
            id: 'photo-frame-5-4',
            x: 300,
            y: 50,
            width: 200,
            height: 200,
            placeholder: '交换戒指'
          },
          {
            id: 'photo-frame-5-5',
            x: 550,
            y: 50,
            width: 150,
            height: 200,
            placeholder: '细节照'
          },
          {
            id: 'photo-frame-5-6',
            x: 150,
            y: 300,
            width: 400,
            height: 200,
            placeholder: '庆祝时刻'
          }
        ],
        textFrames: [
          {
            id: 'text-frame-5-3',
            x: 50,
            y: 520,
            width: 650,
            height: 60,
            placeholder: '美好的回忆永远珍藏'
          }
        ]
      }
    ]
  }
];

export const templateService = {
  // 获取所有模板
  async getTemplates(): Promise<Template[]> {
    await delay(500); // 模拟网络延迟
    return mockTemplates;
  },

  // 根据ID获取单个模板
  async getTemplateById(id: string): Promise<Template | undefined> {
    await delay(300); // 模拟网络延迟
    return mockTemplates.find(template => template.id === id);
  }
};
