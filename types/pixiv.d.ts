interface PixivClientIllust {
  id: number;
  title: string;
  user: {
    id: number;
    name: string;
  };
  tags: Array<{
    name: string;
    translated_name: string | null;
  }>;
  create_date: string;
  width: number;
  height: number;
  meta_single_page: { original_image_url: string };
  meta_pages: Array<{
    image_urls: Record<'square_medium' | 'medium' | 'large' | 'original', string>;
  }>;
  illust_ai_type: number;
}

interface PixivAjaxIllust {
  illustId: string;
  illustTitle: string;
  userId: string;
  userName: string;
  tags: {
    tags: Array<{
      tag: string;
      translation?: Record<string, string>;
    }>;
  };
  width: number;
  height: number;
  pageCount: number;
  urls: Record<'mini' | 'thumb' | 'small' | 'regular' | 'original', string>;
  aiType: number;
}

type PixivAjaxIllustPages = Array<{
  urls: Record<'thumb_mini' | 'small' | 'regular' | 'original', string>;
  width: number;
  height: number;
}>;
