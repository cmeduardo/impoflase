export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export function getImageUrl(
  publicId: string,
  transformation: "thumb" | "catalog" | "detail" = "catalog"
): string {
  const transforms: Record<string, string> = {
    thumb: "f_auto,q_auto,w_400,h_300,c_fill",
    catalog: "f_auto,q_auto,w_800",
    detail: "f_auto,q_auto,w_1200",
  };

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms[transformation]}/${publicId}`;
}

export async function uploadImage(file: File): Promise<{
  url: string;
  public_id: string;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "vehiculos");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Error al subir imagen a Cloudinary");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_id: publicId }),
  });

  if (!response.ok) {
    throw new Error("Error al eliminar imagen");
  }
}
