export const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
};
