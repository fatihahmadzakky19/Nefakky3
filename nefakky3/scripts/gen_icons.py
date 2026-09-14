import base64
import os
import shutil

src_dir = r'C:\Users\User\.gemini\antigravity-ide\brain\0a240fa7-ee18-4c87-a5e5-a69e06a5af1c\.user_uploaded'
dst_dir = r'public\icons'
os.makedirs(dst_dir, exist_ok=True)

# Map all 33 user icons
mapping = {
    'search': ('media_1789190074208.png', 'search.png', 'mask'),
    'basket': ('media_1789190186868.png', 'basket.png', 'mask'),
    'home': ('media_1789190245347.png', 'home.png', 'mask'),
    'phone': ('media_1789190297741.png', 'phone.png', 'mask'),
    'pin': ('media_1789190312476.png', 'location.png', 'mask'),
    'lock': ('media_1789350058807.png', 'lock.png', 'mask'),
    'gmail': ('media_1789350096748.png', 'gmail.png', 'color'),
    'mail': ('media_1789350109824.png', 'mail.png', 'mask'),
    'clock': ('media_1789350221505.png', 'clock.png', 'mask'),
    'user': ('media_1789350246047.png', 'user.png', 'mask'),
    'logout': ('media_1789350327388.png', 'logout.png', 'mask'),
    'leaf': ('media_1789350364717.png', 'leaf.png', 'mask'),
    'ticket': ('media_1789350399772.png', 'ticket.png', 'mask'),
    'flame': ('media_1789350428407.png', 'flame.png', 'mask'),
    'shield': ('media_1789350543783.png', 'shield_check.png', 'color'),
    'star': ('media_1789350845693.png', 'star.png', 'mask'),
    'hourglass': ('media_1789350870926.png', 'hourglass.png', 'mask'),
    'barchart': ('media_1789350941595.png', 'barchart.png', 'mask'),
    'chat': ('media_1789351000262.png', 'chat.png', 'mask'),
    'calendar': ('media_1789351022964.png', 'calendar.png', 'mask'),
    'download': ('media_1789351168297.png', 'download.png', 'mask'),
    'pdf': ('media_1789351180553.png', 'pdf.png', 'mask'),
    'printer': ('media_1789351210334.png', 'printer.png', 'mask'),
    'receipt': ('media_1789351260620.png', 'receipt.png', 'mask'),
    'document': ('media_1789351276170.png', 'document.png', 'mask'),
    'pencil': ('media_1789351404766.png', 'pencil.png', 'mask'),
    'trash': ('media_1789351446108.png', 'trash.png', 'mask'),
    'eye': ('media_1789351498767.png', 'eye.png', 'mask'),
    'check': ('media_1789351576831.png', 'check_circle.png', 'color'),
    'camera': ('media_1789351609464.png', 'camera.png', 'mask'),
    'cooking': ('media_1789351645560.png', 'cooking.png', 'mask'),
    'megaphone': ('media_1789351712684.png', 'megaphone.png', 'mask'),
    'gear': ('media_1789351762688.png', 'settings.png', 'mask')
}

b64_data = {}
for key, (src_name, dst_name, icon_type) in mapping.items():
    s = os.path.join(src_dir, src_name)
    d = os.path.join(dst_dir, dst_name)
    shutil.copyfile(s, d)
    with open(d, 'rb') as f:
        b64_data[key] = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')
    print(f'Processed {key} -> {dst_name}')

template = """import React from 'react';

/**
 * ============================================================================
 * BESPOKE CUSTOM ICONS (Provided by User - 100%% Anti-AI-Slop)
 * ============================================================================
 * Menggunakan 33 aset ikon otentik yang diberikan user dengan CSS mask-image dan bg-current
 * (serta colored image untuk logo Gmail, ShieldCheck, & CheckCircle) sehingga secara presisi mewarisi ukuran
 * (w-4 h-4, w-5 h-5) dan warna (currentColor).
 */

const SEARCH_B64 = __SEARCH__;
const BASKET_B64 = __BASKET__;
const HOME_B64 = __HOME__;
const PHONE_B64 = __PHONE__;
const PIN_B64 = __PIN__;
const LOCK_B64 = __LOCK__;
const GMAIL_B64 = __GMAIL__;
const MAIL_B64 = __MAIL__;
const CLOCK_B64 = __CLOCK__;
const USER_B64 = __USER__;
const LOGOUT_B64 = __LOGOUT__;
const LEAF_B64 = __LEAF__;
const TICKET_B64 = __TICKET__;
const FLAME_B64 = __FLAME__;
const SHIELD_B64 = __SHIELD__;
const STAR_B64 = __STAR__;
const HOURGLASS_B64 = __HOURGLASS__;
const BARCHART_B64 = __BARCHART__;
const CHAT_B64 = __CHAT__;
const CALENDAR_B64 = __CALENDAR__;
const DOWNLOAD_B64 = __DOWNLOAD__;
const PDF_B64 = __PDF__;
const PRINTER_B64 = __PRINTER__;
const RECEIPT_B64 = __RECEIPT__;
const DOCUMENT_B64 = __DOCUMENT__;
const PENCIL_B64 = __PENCIL__;
const TRASH_B64 = __TRASH__;
const EYE_B64 = __EYE__;
const CHECK_B64 = __CHECK__;
const CAMERA_B64 = __CAMERA__;
const COOKING_B64 = __COOKING__;
const MEGAPHONE_B64 = __MEGAPHONE__;
const GEAR_B64 = __GEAR__;

export interface CustomIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  size?: number | string;
}

function createMaskIcon(b64: string, label: string) {
  const IconComponent = ({ className = 'w-5 h-5', size, style, ...props }: CustomIconProps) => {
    const sizeStyle = size
      ? {
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }
      : {};

    return (
      <span
        role="img"
        aria-label={label}
        className={`inline-block shrink-0 bg-current transition-all select-none ${className}`}
        style={{
          maskImage: `url("${b64}")`,
          WebkitMaskImage: `url("${b64}")`,
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
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }
      : {};

    return (
      <span
        role="img"
        aria-label={label}
        className={`inline-block shrink-0 bg-contain bg-center bg-no-repeat transition-all select-none ${className}`}
        style={{
          backgroundImage: `url("${b64}")`,
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

// 1. Core User-Provided Icons
export const CustomSearch = createMaskIcon(SEARCH_B64, 'Search');
export const CustomBasket = createMaskIcon(BASKET_B64, 'Shopping Basket');
export const CustomHome = createMaskIcon(HOME_B64, 'Home');
export const CustomPhone = createMaskIcon(PHONE_B64, 'Phone');
export const CustomMapPin = createMaskIcon(PIN_B64, 'Location Pin');
export const CustomLock = createMaskIcon(LOCK_B64, 'Lock');
export const CustomMail = createMaskIcon(MAIL_B64, 'Mail');
export const CustomClock = createMaskIcon(CLOCK_B64, 'Clock');
export const CustomUser = createMaskIcon(USER_B64, 'User');
export const CustomGmail = createColoredIcon(GMAIL_B64, 'Gmail');
export const CustomLogOut = createMaskIcon(LOGOUT_B64, 'Log Out');
export const CustomLeaf = createMaskIcon(LEAF_B64, 'Leaf');
export const CustomTicket = createMaskIcon(TICKET_B64, 'Ticket Voucher');
export const CustomFlame = createMaskIcon(FLAME_B64, 'Flame Hot');
export const CustomShieldCheck = createColoredIcon(SHIELD_B64, 'Shield Check');
export const CustomStar = createMaskIcon(STAR_B64, 'Star Rating');
export const CustomHourglass = createMaskIcon(HOURGLASS_B64, 'Hourglass');
export const CustomBarChart = createMaskIcon(BARCHART_B64, 'Bar Chart');
export const CustomChat = createMaskIcon(CHAT_B64, 'Chat Message');
export const CustomCalendar = createMaskIcon(CALENDAR_B64, 'Calendar');
export const CustomDownload = createMaskIcon(DOWNLOAD_B64, 'Download');
export const CustomPdf = createMaskIcon(PDF_B64, 'PDF Document');
export const CustomPrinter = createMaskIcon(PRINTER_B64, 'Printer');
export const CustomReceipt = createMaskIcon(RECEIPT_B64, 'Receipt');
export const CustomDocument = createMaskIcon(DOCUMENT_B64, 'Document');
export const CustomPencil = createMaskIcon(PENCIL_B64, 'Pencil');
export const CustomTrash = createMaskIcon(TRASH_B64, 'Trash');
export const CustomEye = createMaskIcon(EYE_B64, 'Eye');
export const CustomCheckCircle = createColoredIcon(CHECK_B64, 'Check Circle');
export const CustomCamera = createMaskIcon(CAMERA_B64, 'Camera');
export const CustomCooking = createMaskIcon(COOKING_B64, 'Cooking');
export const CustomMegaphone = createMaskIcon(MEGAPHONE_B64, 'Megaphone');
export const CustomGear = createMaskIcon(GEAR_B64, 'Gear Settings');

// 2. Drop-in aliases for Lucide icons
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
"""

for key in b64_data:
    template = template.replace(f'__{key.upper()}__', repr(b64_data[key]))

with open('src/components/icons/CustomIcons.tsx', 'w', encoding='utf-8') as out:
    out.write(template)

print("CustomIcons.tsx with 33 user icons generated successfully!")
