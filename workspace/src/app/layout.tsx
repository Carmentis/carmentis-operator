'use client';


import "bootstrap-icons/font/bootstrap-icons.min.css"
import "./globals.css";
import { toast, ToastContainer, } from 'react-toastify';



export const useToastNotification = () => {
    return (message: string) => {
        toast(message)
    }
}

export const useToast = () => {
    return {
        info: (message: string) =>  {
            toast.info(message)
        },
        error: (message: string) =>  {
            toast.error(message)
        }
    }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        <ToastContainer
            position="bottom-center"
        />
        {children}
      </body>
    </html>
  );
}
