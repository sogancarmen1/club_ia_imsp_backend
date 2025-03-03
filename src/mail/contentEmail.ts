function ContentEmails(lien: string, textButton: string, text: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Template</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background: radial-gradient(circle, #ffffff, #f4f4f4);
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #093ea8, #3bd7ec);
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }
            .logo {
                max-width: 100px;
                margin-bottom: 10px;
            }
            .content {
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e0e0e0;
                border-bottom: 1px solid #e0e0e0;
                margin: 20px 0;
            }
            .button {
                display: inline-block;
                background: #3bd7ec;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                margin-top: 15px;
                transition: background 0.3s ease, transform 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                animation: pulse 2s infinite;
            }
            .button:hover {
                background: #22a1c4;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #555;
                padding: 15px;
            }
            a {
                color: #093ea8;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <img src="https://via.placeholder.com/100" alt="Logo" class="logo" />
                    <h1>Bienvenue sur Notre Application</h1>
                    <img src="https://via.placeholder.com/400x200" alt="Illustration" class="illustration" />
                </div>
                <div class="content">
                    <h2>Bonjour/Bonsoir !</h2>
                    <p>
                        <i class="fas fa-check-circle" style="color: #3bd7ec;"></i>
                        Merci pour votre inscription sur notre plateforme. Nous sommes ravis de vous compter parmi nous. ${text}
                    </p>
                    <a href="${lien}" class="button">${textButton}</a>
                    <p>
                        Si vous avez des questions, n'hésitez pas à nous contacter à
                        <a href="club.ia@imsp-uac.org">club.ia@imsp-uac.org</a>.
                    </p>
                </div>
                <div class="footer">
                    <p>Suivez-nous sur :</p>
                    <a href="https://facebook.com" style="color: #093ea8; margin: 0 10px;"><i class="fab fa-facebook"></i></a>
                    <a href="https://twitter.com" style="color: #093ea8; margin: 0 10px;"><i class="fab fa-twitter"></i></a>
                    <a href="https://linkedin.com" style="color: #093ea8; margin: 0 10px;"><i class="fab fa-linkedin"></i></a>
                    <p>© 2023 Votre Société. Tous droits réservés.</p>
                </div>
            </div>
        </body>
    </html>
  `;
}

export default ContentEmails;
