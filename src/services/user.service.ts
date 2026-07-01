import { prisma } from "@/lib/db";
import { Role, User } from "@/types/auth";

export class UserService {
  /**
   * Finds or creates a user based on their phone number
   */
  static async findOrCreateByPhone(phone: string): Promise<User> {
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: "CUSTOMER"
        }
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
