
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  PageNumber, 
  Footer,
  FootnoteReferenceRun,
  NumberFormat,
  SectionType
} from "docx";
import { StructuredDocument } from "../types";

const FONT_ARABIC = "Traditional Arabic";
const SIZE_TITLE = 36;    // 18pt
const SIZE_HEADING = 32;  // 16pt
const SIZE_BODY = 32;     // 16pt
const SIZE_FOOTNOTE = 24; // 12pt
const LINE_SPACING = 360; // 1.5 lines

const MARGIN_RIGHT = 1701;  // 3 cm (جهة التجليد لليمين)
const MARGIN_LEFT = 1417;   // 2.5 cm
const MARGIN_TOP = 1417;    // 2.5 cm
const MARGIN_BOTTOM = 1417; // 2.5 cm

export const generateSaudiDocx = async (data: StructuredDocument): Promise<Blob> => {
  try {
    const footnoteIdMap = new Map<string, number>();
    const docxFootnotes: Record<number, { children: Paragraph[] }> = {};
    
    // 1. إعداد الحواشي - استخدام المرجع البرمجي فقط لتجنب التكرار (١)١
    data.footnotes.forEach((f, index) => {
      const numId = index + 1;
      footnoteIdMap.set(f.id, numId);
      docxFootnotes[numId] = {
        children: [
          new Paragraph({
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
            spacing: { line: 240 },
            children: [
              new TextRun({ text: "(", font: FONT_ARABIC, size: SIZE_FOOTNOTE }),
              new FootnoteReferenceRun(numId),
              new TextRun({ text: ") ", font: FONT_ARABIC, size: SIZE_FOOTNOTE }),
              new TextRun({
                text: f.text,
                font: FONT_ARABIC,
                size: SIZE_FOOTNOTE,
                rightToLeft: true,
              })
            ],
          })
        ]
      };
    });

    const bodyChildren: Paragraph[] = [];

    // 2. العنوان الرئيسي (وسط)
    bodyChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 1200 },
        bidirectional: true,
        children: [
          new TextRun({
            text: data.title,
            font: FONT_ARABIC,
            size: SIZE_TITLE,
            bold: true,
            rightToLeft: true,
          })
        ]
      })
    );

    // 3. بناء المتن والعناوين (يمين)
    data.elements.forEach(el => {
      let size = SIZE_BODY;
      let bold = false;
      let alignment = AlignmentType.JUSTIFIED;
      let spacingBefore = 240;

      // العناوين تظهر جهة اليمين حصراً
      if (el.type.includes('heading')) {
        size = SIZE_HEADING;
        bold = true;
        alignment = AlignmentType.RIGHT; 
        spacingBefore = 500;
      }

      const runs: any[] = [];
      // تقسيم النص بدقة للحفاظ على موضع الحاشية بجانب الكلمة مباشرة
      const parts = el.text.split(/(\[\[FN:[^\]]+\]\])/g);

      parts.forEach(part => {
        const match = part.match(/\[\[FN:([^\]]+)\]\]/);
        if (match) {
          const fId = match[1];
          const numId = footnoteIdMap.get(fId);
          if (numId !== undefined) {
            // إضافة المرجع بين أقواس (١) مرتفع
            runs.push(new TextRun({ text: "(", font: FONT_ARABIC, size: 24, superScript: true }));
            runs.push(new FootnoteReferenceRun(numId));
            runs.push(new TextRun({ text: ")", font: FONT_ARABIC, size: 24, superScript: true }));
          }
        } else {
          runs.push(new TextRun({
            text: part,
            font: FONT_ARABIC,
            size: size,
            bold: bold,
            rightToLeft: true,
          }));
        }
      });

      bodyChildren.push(
        new Paragraph({
          children: runs,
          alignment: alignment,
          spacing: { line: LINE_SPACING, before: spacingBefore, after: 150 },
          bidirectional: true, // ضروري جداً لضمان المحاذاة الصحيحة في وورد
        })
      );
    });

    // 4. إعدادات المستند (إعادة الترقيم لكل صفحة + أرقام هندية)
    const doc = new Document({
      footnotes: docxFootnotes,
      settings: {
        footnoteNumbering: {
          start: 1,
          restart: "eachPage" as any, // إعادة الترقيم لكل صفحة (١)
          format: NumberFormat.ARABIC_INDIC as any, // أرقام عربية شرقية (١، ٢، ٣)
        },
      },
      styles: {
        default: {
          document: {
            run: {
              font: FONT_ARABIC,
              rightToLeft: true,
            },
          },
        },
      },
      sections: [
        {
          properties: {
            type: SectionType.CONTINUOUS,
            page: {
              margin: {
                top: MARGIN_TOP,
                right: MARGIN_RIGHT, // 3 سم يمين
                bottom: MARGIN_BOTTOM,
                left: MARGIN_LEFT,
              },
            },
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      font: FONT_ARABIC,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
          },
          children: bodyChildren,
        },
      ],
    });

    return await Packer.toBlob(doc);
  } catch (error) {
    console.error("Docx Professional Error:", error);
    throw new Error("حدث خطأ في محرك التنسيق. تأكد من جودة النص المدخل.");
  }
};
