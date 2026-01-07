'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { EditorLayout } from '@/components/feasibility/editor';

export default function FeasibilityEditorPage() {
  const params = useParams();
  const studyId = params.id as string;

  // في المستقبل سيتم جلب بيانات الدراسة من API
  // const { data: study, isLoading } = useFeasibilityStudy(studyId);

  return (
    <EditorLayout 
      studyId={studyId}
      clientName="عميل جديد" // سيتم استبداله ببيانات العميل الفعلية
    />
  );
}
