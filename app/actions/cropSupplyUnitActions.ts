//get all crop supply units like: Kompina, Kompina CRT, Kompina SmallHolders
export async function getCropSuppyUnit() {
  try {
    const res = await fetch(
      "https://fact-data.onrender.com/api/crop-supply-units"
    );
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get supply unit", error);
  }
}

//add other actions..
