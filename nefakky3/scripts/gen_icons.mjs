import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcDir = path.join(rootDir, 'public', 'icons');

// 33 user icons mapping: [key, fileName, type ('mask' | 'color')]
const mapping = {
  search: ['search.png', 'mask'],
  basket: ['basket.png', 'mask'],
  home: ['home.png', 'mask'],
  phone: ['phone.png', 'mask'],
  pin: ['location.png', 'mask'],
  lock: ['lock.png', 'mask'],
  gmail: ['gmail.png', 'color'],
  mail: ['mail.png', 'mask'],
  clock: ['clock.png', 'mask'],
  user: ['user.png', 'mask'],
  logout: ['logout.png', 'mask'],
  leaf: ['leaf.png', 'mask'],
  ticket: ['ticket.png', 'mask'],
  flame: ['flame.png', 'mask'],
  shield: ['shield_check.png', 'color'],
  star: ['star.png', 'mask'],
  hourglass: ['hourglass.png', 'mask'],
  barchart: ['barchart.png', 'mask'],
  chat: ['chat.png', 'mask'],
  calendar: ['calendar.png', 'mask'],
  download: ['download.png', 'mask'],
  pdf: ['pdf.png', 'mask'],
  printer: ['printer.png', 'mask'],
  receipt: ['receipt.png', 'mask'],
  document: ['document.png', 'mask'],
  pencil: ['pencil.png', 'mask'],
  trash: ['trash.png', 'mask'],
  eye: ['eye.png', 'mask'],
  check: ['check_circle.png', 'color'],
  camera: ['camera.png', 'mask'],
  cooking: ['cooking.png', 'mask'],
  megaphone: ['megaphone.png', 'mask'],
  gear: ['settings.png', 'mask'],
};

const b64Data = {};
for (const [key, [fileName]] of Object.entries(mapping)) {
  const filePath = path.join(srcDir, fileName);
  if (fs.existsSync(filePath)) {
    const fileBuf = fs.readFileSync(filePath);
    b64Data[key] = `data:image/png;base64,${fileBuf.toString('base64')}`;
    console.log(`Processed ${key} -> ${fileName}`);
  } else {
    console.warn(`Warning: file not found: ${filePath}`);
  }
}

let template = `import React from 'react';

/**
 * ============================================================================
 * KOMPONEN: CustomIcons.tsx
 * DESKRIPSI: Kumpulan 33 ikon kustom autentik buatan tangan (Anti-AI-Slop).
 *            Menggunakan teknik CSS mask-image Base64 untuk adaptasi warna
 *            Tailwind (bg-current) serta background-image untuk ikon berwarna.
 * ============================================================================
 */

export interface CustomIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  size?: number | string;
}

function createMaskIcon(b64: string, label: string) {
  const IconComponent = ({ className = 'w-5 h-5', size, style, ...props }: CustomIconProps) => {
    const sizeStyle = size
      ? {
          width: typeof size === 'number' ? \`\${size}px\` : size,
          height: typeof size === 'number' ? \`\${size}px\` : size,
        }
      : {};

    return (
      <span
        role="img"
        aria-label={label}
        className={\`inline-block shrink-0 bg-current transition-all select-none \${className}\`}
        style={{
          maskImage: \`url("\${b64}")\`,
          WebkitMaskImage: \`url("\${b64}")\`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          ...sizeStyle,
          ...style,
        }}
        {...props}
      />
    );
  };
  IconComponent.displayName = label;
  return IconComponent;
}

function createColoredIcon(b64: string, label: string) {
  const IconComponent = ({ className = 'w-5 h-5', size, style, ...props }: CustomIconProps) => {
    const sizeStyle = size
      ? {
          width: typeof size === 'number' ? \`\${size}px\` : size,
          height: typeof size === 'number' ? \`\${size}px\` : size,
        }
      : {};

    return (
      <span
        role="img"
        aria-label={label}
        className={\`inline-block shrink-0 bg-contain bg-center bg-no-repeat transition-all select-none \${className}\`}
        style={{
          backgroundImage: \`url("\${b64}")\`,
          ...sizeStyle,
          ...style,
        }}
        {...props}
      />
    );
  };
  IconComponent.displayName = label;
  return IconComponent;
}

// 1. Raw Base64 constants
export const SEARCH_B64 = __SEARCH__;
export const BASKET_B64 = __BASKET__;
export const HOME_B64 = __HOME__;
export const PHONE_B64 = __PHONE__;
export const PIN_B64 = __PIN__;
export const LOCK_B64 = __LOCK__;
export const GMAIL_B64 = __GMAIL__;
export const MAIL_B64 = __MAIL__;
export const CLOCK_B64 = __CLOCK__;
export const USER_B64 = __USER__;
export const LOGOUT_B64 = __LOGOUT__;
export const LEAF_B64 = __LEAF__;
export const TICKET_B64 = __TICKET__;
export const FLAME_B64 = __FLAME__;
export const SHIELD_B64 = __SHIELD__;
export const STAR_B64 = __STAR__;
export const HOURGLASS_B64 = __HOURGLASS__;
export const BARCHART_B64 = __BARCHART__;
export const CHAT_B64 = __CHAT__;
export const CALENDAR_B64 = __CALENDAR__;
export const DOWNLOAD_B64 = __DOWNLOAD__;
export const PDF_B64 = __PDF__;
export const PRINTER_B64 = __PRINTER__;
export const RECEIPT_B64 = __RECEIPT__;
export const DOCUMENT_B64 = __DOCUMENT__;
export const PENCIL_B64 = __PENCIL__;
export const TRASH_B64 = __TRASH__;
export const EYE_B64 = __EYE__;
export const CHECK_B64 = __CHECK__;
export const CAMERA_B64 = __CAMERA__;
export const COOKING_B64 = __COOKING__;
export const MEGAPHONE_B64 = __MEGAPHONE__;
export const GEAR_B64 = __GEAR__;

// 2. Custom Icon Components
export const CustomSearch = createMaskIcon(SEARCH_B64, 'Search');
export const CustomBasket = createMaskIcon(BASKET_B64, 'Shopping Basket');
export const CustomHome = createMaskIcon(HOME_B64, 'Home');
export const CustomPhone = createMaskIcon(PHONE_B64, 'Phone');
export const CustomMapPin = createMaskIcon(PIN_B64, 'Map Pin');
export const CustomLock = createMaskIcon(LOCK_B64, 'Lock');
export const CustomGmail = createColoredIcon(GMAIL_B64, 'Gmail');
export const CustomMail = createMaskIcon(MAIL_B64, 'Mail');
export const CustomClock = createMaskIcon(CLOCK_B64, 'Clock');
export const CustomUser = createMaskIcon(USER_B64, 'User Avatar');
export const CustomLogOut = createMaskIcon(LOGOUT_B64, 'Log Out');
export const CustomLeaf = createMaskIcon(LEAF_B64, 'Leaf Vegetarian');
export const CustomTicket = createMaskIcon(TICKET_B64, 'Ticket Voucher');
export const CustomFlame = createMaskIcon(FLAME_B64, 'Flame Pedas');
export const CustomShieldCheck = createColoredIcon(SHIELD_B64, 'Shield Check');
export const CustomStar = createMaskIcon(STAR_B64, 'Rating Star');
export const CustomHourglass = createMaskIcon(HOURGLASS_B64, 'Hourglass');
export const CustomBarChart = createMaskIcon(BARCHART_B64, 'Bar Chart');
export const CustomChat = createMaskIcon(CHAT_B64, 'Chat Message');
export const CustomCalendar = createMaskIcon(CALENDAR_B64, 'Calendar');
export const CustomDownload = createMaskIcon(DOWNLOAD_B64, 'Download');
export const CustomPdf = createMaskIcon(PDF_B64, 'PDF Document');
export const CustomPrinter = createMaskIcon(PRINTER_B64, 'Printer Thermal');
export const CustomReceipt = createMaskIcon(RECEIPT_B64, 'Receipt Kasir');
export const CustomDocument = createMaskIcon(DOCUMENT_B64, 'Document File');
export const CustomPencil = createMaskIcon(PENCIL_B64, 'Pencil Edit');
export const CustomTrash = createMaskIcon(TRASH_B64, 'Trash Delete');
export const CustomEye = createMaskIcon(EYE_B64, 'Eye Preview');
export const CustomCheckCircle = createColoredIcon(CHECK_B64, 'Check Circle');
export const CustomCamera = createMaskIcon(CAMERA_B64, 'Camera Snapshot');
export const CustomCooking = createMaskIcon(COOKING_B64, 'Cooking Wok');
export const CustomMegaphone = createMaskIcon(MEGAPHONE_B64, 'Megaphone');
export const CustomGear = createMaskIcon(GEAR_B64, 'Gear Settings');

// 3. Drop-in Aliases
export const Search = CustomSearch;
export const ShoppingBag = CustomBasket;
export const ShoppingCart = CustomBasket;
export const Home = CustomHome;
export const Phone = CustomPhone;
export const MapPin = CustomMapPin;
export const Lock = CustomLock;
export const Mail = CustomMail;
export const Clock = CustomClock;
export const User = CustomUser;
export const Gmail = CustomGmail;
export const Google = CustomGmail;
export const LogOut = CustomLogOut;
export const Leaf = CustomLeaf;
export const Ticket = CustomTicket;
export const Tag = CustomTicket;
export const Flame = CustomFlame;
export const ShieldCheck = CustomShieldCheck;
export const Star = CustomStar;
export const Hourglass = CustomHourglass;
export const BarChart = CustomBarChart;
export const BarChart2 = CustomBarChart;
export const BarChart3 = CustomBarChart;
export const MessageSquare = CustomChat;
export const MessageCircle = CustomChat;
export const Calendar = CustomCalendar;
export const CalendarClock = CustomCalendar;
export const Download = CustomDownload;
export const FileDown = CustomDownload;
export const Pdf = CustomPdf;
export const FileSpreadsheet = CustomPdf;
export const Printer = CustomPrinter;
export const Receipt = CustomReceipt;
export const FileText = CustomDocument;
export const File = CustomDocument;
export const Pencil = CustomPencil;
export const Edit = CustomPencil;
export const Edit3 = CustomPencil;
export const Trash = CustomTrash;
export const Trash2 = CustomTrash;
export const Eye = CustomEye;
export const CheckCircle = CustomCheckCircle;
export const CheckCircle2 = CustomCheckCircle;
export const Camera = CustomCamera;
export const CookingPot = CustomCooking;
export const Utensils = CustomCooking;
export const UtensilsCrossed = CustomCooking;
export const ChefHat = CustomCooking;
export const Bell = CustomMegaphone;
export const Radio = CustomMegaphone;
export const Megaphone = CustomMegaphone;
export const Settings = CustomGear;
export const Settings2 = CustomGear;
export const Sliders = CustomGear;
export const SlidersHorizontal = CustomGear;
`;

for (const [key, val] of Object.entries(b64Data)) {
  template = template.replace(`__${key.toUpperCase()}__`, JSON.stringify(val));
}

const outputPath = path.join(rootDir, 'src', 'components', 'icons', 'CustomIcons.tsx');
fs.writeFileSync(outputPath, template, 'utf-8');
console.log('CustomIcons.tsx with 33 user icons generated successfully via Node.js!');
