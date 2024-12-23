export interface Announcement {
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  publishedAt: string;
  clearedBy?: string[];
  seenBy?: string[];
  id: string;
}

export interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Announcement) => void;
}

export interface AnnouncementListProps {
  announcements: Announcement[];
  onDelete: (id: string) => void;
}
