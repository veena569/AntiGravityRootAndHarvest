import { prisma } from "@/lib/db";
import { Role, User } from "@/types/auth";

export class UserService {
  /**
   * Finds or creates a user based on their phone number, optionally updating the name
   */
  static async findOrCreateByPhone(phone: string, name?: string): Promise<User> {
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
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
