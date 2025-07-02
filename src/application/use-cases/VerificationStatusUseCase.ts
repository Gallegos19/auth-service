import { inject, injectable } from "inversify";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserId } from "../../domain/value-objects/UserId";

@injectable()
export class VerificationStatusUseCase {
    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository
    ) {}

    async execute(userId: string): Promise<{ verified: boolean }> {
        const user = await this.userRepository.findById(new UserId(userId));
        if (!user) {
            throw new Error('User not found');
        }
        // Use the public getter or property to access verification status
        return { verified: !!user.getIsVerified };
    }
}