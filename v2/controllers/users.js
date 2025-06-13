import { UsersModelV2 } from "../models/users.js";

export class UsersControllerV2 {
    static async getUser (req, res) {
        const id = req.params.id.toLowerCase();
    
        if (!id) {
            return res.status(400).json({
                status: "error",
                error: {
                    code: 400,
                    message: "User ID is required"
                }
            });
        }
    
        try {
            const result = await UsersModelV2.getUser(id);
            if (!result || !result.user) {
                return res.status(404).json({
                    status: "error",
                    error: {
                        code: 404,
                        message: "User not found"
                    }
                });
            }

            return res.status(200).json({
                status: "success",
                data: result.user
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                status: "error",
                error: {
                    code: 500,
                    message: "Internal server error"
                }
            });
        }
    }
}