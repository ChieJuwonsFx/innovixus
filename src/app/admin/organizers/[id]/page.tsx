type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOrganizerPage({ params }: PageProps) {
  const { id } = await params;
  return <div>Edit Organizer Page — ID: {id}</div>;
}
