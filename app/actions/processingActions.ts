export async function getCropProcessing(factoryId?: number) {
  //if factoryId is provided, use it to filter otherwise return all processings
  try {
    const url = factoryId
      ? `https://fact-data.onrender.com/api/crop-processings?factoryId=${factoryId}`
      : `https://fact-data.onrender.com/api/crop-processings`;
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch (error) {
    console.error("failed fetch data", error);
  }
}

//create new processing
export async function createCropProcessing(data: any) {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/crop-processings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) return res.json();
    throw new Error("Failed to create crop processing");
  } catch (error) {
    console.error("Error creating crop processing:", error);
  }
}
//update existing processing
export async function updateCropProcessing(id: string, data: any) {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/crop-processings/${id}`,
      {
        method: "PUT", // or PATCH depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) return res.json();
    throw new Error("Failed to update crop processing");
  } catch (error) {
    console.error("Error updating crop processing:", error);
  }
}
//delete processing
export async function deleteCropProcessing(id: string) {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/crop-processings/${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) return res.json();
    throw new Error("Failed to delete crop processing");
  } catch (error) {
    console.error("Error deleting crop processing:", error);
  }
}
