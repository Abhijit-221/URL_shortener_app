const User = require("../../models/userModel");

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CALLBACK_URL = "http://localhost:8000/google/callback";

const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_OAUTH_SCOPES = [
    "https%3A//www.googleapis.com/auth/userinfo.email",
    "https%3A//www.googleapis.com/auth/userinfo.profile",
];

module.exports = {
    /**
     * @filename auth.js
     * @method get
     * @router /login
     * @auther Abhijit swain
     * @description login user.
     */
    login: async (req, res) => {
        try {
            const state = "some_state";
            const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
            const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
            return res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);

        }
        catch (error) {
            return res.status(500).json({
                status: 500,
                data: {},
                error: error,
                message: "Internal server error"
            })
        }
    },
    /**
     * @filename auth.js
     * @method redirect
     * @router /google/callback
     * @auther Abhijit swain
     * @description redirect and usercreate.
     */
    redirect: async (req, res) => {
        try {
            console.log(req.query);
            const { code } = req.query;
            const data = {
                code,

                client_id: GOOGLE_CLIENT_ID,

                client_secret: GOOGLE_CLIENT_SECRET,

                redirect_uri: GOOGLE_CALLBACK_URL,

                grant_type: "authorization_code",
            };

            console.log(data);

            const response = await fetch(`${GOOGLE_ACCESS_TOKEN_URL}`, {
                method: "POST",
                body: JSON.stringify(data),
            });
            console.log('response:', response);
            const access_token_data = await response.json();
            const { id_token } = access_token_data;

            console.log("id_token:", id_token);

            // verify and extract the information in the id token

            const token_info_response = await fetch(
                `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
            );
            const token_info_data = await token_info_response.json();
            const { email, name } = token_info_data;
            console.log('email:', email, name);
            let user = await User.findOne({ email }).select("-password");
            if (!user) {
                user = await User.create({ email, name });
            }
            const token = user.generateToken();
            return res.status(200).json({ 
                status:200,
                data:{user,token},
                error:{},
                message:"Login successfully."
             });
        }
        catch (error) {
            return res.status(500).json({
                status: 500,
                data: {},
                error: error,
                message: "Internal server error"
            })
        }
    }

}