import { prisma } from "@/lib/db";
import { Role, User } from "@/types/auth";

export class UserService {
  /**
   * Finds or creates a user based on their phone number, optionally updating the name
   */
  static async findOrCreateByPhone(phone: string, name?: string): Promise<User> {
    const cleanDigits = phone.replace(/\D/g, "").slice(-10);
    const withPlus91 = `+91${cleanDigits}`;
    const rawWithPlus = phone.startsWith("+") ? phone : `+${phone}`;

    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone },
            { phone: withPlus91 },
            { phone: cleanDigits },
            { phone: rawWithPlus },
          ]
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: withPlus91,
            name: name || null,
            role: "CUSTOMER"
          }
        });
      } else if (name && !user.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name }
        });
      }
    } catch (err) {
      console.error("[USER_SERVICE_DB_ERROR]", err);
      // Graceful fallback customer session
      return {
        id: `guest-${cleanDigits}`,
        name: name || "Customer",
        email: null,
        phone: withPlus91,
        role: "CUSTOMER"
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as Role
    };
  }

  /**
   * Finds or creates a user based on their email address, optionally updating the name
   */
  static async findOrCreateByEmail(email: string, name?: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || null,
          role: "CUSTOMER"
        }
      });
    } else if (name && !user.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name }
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as Role
    };
  }
}
