import prisma from "@/utils/prisma";
import { Listing } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

async function createNewAd(adData: Omit<Listing, "id" | "createdAt" | "updatedAt" | "reported" | "views" | "featured" | "images" | "tags" | "messages" | "favorites" | "userId">, userId: string) {
  try {
    // Basic validation - consider using a library like Joi for more complex validation
    if (!adData.name || !adData.location || !adData.categoryId) {
      throw new Error("Missing required fields: name, location, or categoryId");
    }

    const newAd = await prisma.listing.create({
      data: {
        ...adData,
        price: adData.price ? parseInt(String(adData.price), 10) : null,
        userId: userId, // Ensure userId is correctly passed and used
      },
    });
    return newAd;
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Error in createNewAd:", error);
    // Re-throw the original error or a new specific error
    if (error instanceof Error) {
      throw error; // Re-throw the original error
    }
    throw new Error("Failed to create new ad."); // Fallback error
  }
}

// POST '/api/listings/'
export default async function handler( // Renamed Handler to handler (lowercase) for Next.js convention
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: Session | null = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "401 - Not Authorized" });
  }

  const userId = session.user?.id; // The @ts-expect-error is removed as types/next-auth.d.ts should now provide the correct type.

  if (!userId) {
    return res.status(401).json({ message: "User ID not found in session." });
  }

  if (req.method === "POST") {
    try {
      const { name, description, condition, price, location, categoryId, canDeliver } = req.body;

      // Construct the adData object carefully, ensuring all required fields are present
      // and types are correct.
      // Note: 'images' and 'tags' would typically be handled separately,
      // e.g., by creating Image and Tag records and linking them.
      // For this fix, I'm assuming a simpler structure based on the current CreateNewAd.
      const adDataFromRequest: Omit<Listing, "id" | "createdAt" | "updatedAt" | "reported" | "views" | "featured" | "userId" | "images" | "tags" | "messages" | "favorites"> = {
        name,
        description,
        condition, // Assuming this comes in the correct Enum format
        price, // Will be parsed in createNewAd
        location,
        categoryId,
        canDeliver: !!canDeliver, // Ensure boolean
      };

      const newAd = await createNewAd(adDataFromRequest, userId);
      return res.status(201).json(newAd);
    } catch (error: any) {
      console.error("API error in POST /api/listings:", error);
      return res.status(500).json({ message: error.message || "An unexpected error occurred." });
    }
  } else {
    res.setHeader("Allow", ["POST"]); // Corrected: Allow header takes an array of methods
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
