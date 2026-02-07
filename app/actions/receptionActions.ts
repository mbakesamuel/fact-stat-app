import { Reception } from "@/lib/types";

//get crop Receptions
export async function getCropReception(factoryId?: string) {
  try {
    const url = factoryId
      ? `https://fact-data.onrender.com/api/crop-receptions?factoryId=${factoryId}`
      : `https://fact-data.onrender.com/api/crop-receptions`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("failed to fetch");

    return res.json();
  } catch (error) {
    console.error("failed to fetch", error);
  }
}

//create crop Reception
export async function createCropReception(
  data: Reception
): Promise<Reception | undefined> {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/crop-receptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error("failed to create crop reception");

    return res.json();
  } catch (error) {
    console.error("failed to create crop reception", error);
  }
}

//update crop Reception
export async function updateCropReception(
  id: string | undefined,
  data: Reception
): Promise<Reception | undefined> {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/crop-receptions/${id}`,
      {
        method: "PUT", // or "PATCH" if your API expects partial updates
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) throw new Error("failed to update crop reception");

    return res.json();
  } catch (error) {
    console.error("failed to update crop reception", error);
  }
}

//delete crop Reception
export async function deleteCropReception(id: string) {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/crop-receptions/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("failed to delete crop reception");

    return res.json();
  } catch (error) {
    console.error("failed to delete crop reception", error);
  }
}
