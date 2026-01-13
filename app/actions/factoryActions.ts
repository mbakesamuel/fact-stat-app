//get all factories
export async function getFactory() {
  try {
    const res = await fetch("https://fact-data.onrender.com/api/factories");
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get factories", error);
  }
}

//get single factory
export async function getSingleFactory(factoryId: number) {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/factories/${factoryId}`
    );
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get factories", error);
  }
}
