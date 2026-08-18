'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import AdminReviewsTab from '@/components/admin/AdminReviewsTab';

export default function AdminReviewsPage() {
  const { reviews, deleteReview, addReviewReply } = useData();

  return (
    <AdminReviewsTab
      reviewList={reviews || []}
      deleteReview={deleteReview}
      addReviewReply={addReviewReply}
    />
  );
}
