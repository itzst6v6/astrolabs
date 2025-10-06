const userService = require('../services/user.service');

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required.' });
    try {
        const user = userService.findByUsername(username);
        const isValid = await userService.validatePassword(password, user);
        if (isValid) {
            req.session.user = { username: user.username };
            return res.json({ success: true });
        }
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
    } catch (e) { res.status(500).json({ success: false, message: 'An internal error occurred.' }); }
};

const logout = (req, res) => req.session.destroy(e => res.json({ success: !e }));

const getSession = (req, res) => req.session.user ? res.json({ success: true, user: req.session.user }) : res.status(401).json({ success: false });

module.exports = { login, logout, getSession };
