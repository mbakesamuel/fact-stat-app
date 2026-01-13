export async function getFieldGrades() {
  try {
    const res = await fetch("https://fact-data.onrender.com/api/field-grades");
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get supply unit", error);
  }
}

export async function getFactoryGrades() {
  try {
    const res = await fetch(
      "https://fact-data.onrender.com/api/factory-grades"
    );
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get supply unit", error);
  }
}
