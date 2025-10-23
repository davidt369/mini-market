import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportData {
    title: string;
    headers: string[];
    rows: (string | number | boolean | null)[][];
    summary?: Record<string, string | number>;
}

// Colores corporativos profesionales
const COLORS = {
    primary: [59, 89, 152], // Azul profesional
    secondary: [240, 240, 240], // Gris claro
    accent: [44, 62, 80], // Azul oscuro
    success: [46, 204, 113], // Verde
    warning: [241, 196, 15], // Amarillo
    danger: [231, 76, 60], // Rojo
    textDark: [51, 51, 51], // Texto oscuro
    textLight: [255, 255, 255], // Texto claro
};

/**
 * Export data to PDF with professional styling
 */
export function exportToPDF(
    data: ExportData,
    themeColor: number[] = COLORS.primary,
) {
    const doc = new jsPDF();
    type JsPDFExt = jsPDF & {
        autoTable?: (opts: AutoTableOptions) => void;
        splitTextToSize?: (text: string, maxWidth: number) => string[];
        lastAutoTable?: { finalY: number };
    };
    const pdf = doc as JsPDFExt;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;

    // Header con gradiente profesional
    pdf.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    pdf.rect(0, 0, pageWidth, 25, 'F');

    // Logo/Icono (opcional)
    pdf.setFillColor(255, 255, 255, 0.9);
    pdf.circle(margin, 12, 4, 'F');

    // Título principal
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(
        COLORS.textLight[0],
        COLORS.textLight[1],
        COLORS.textLight[2],
    );
    pdf.text(data.title, pageWidth / 2, 15, { align: 'center' });

    // Subtítulo con fecha
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255, 0.8);
    pdf.text(
        `Generado el: ${new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })}`,
        pageWidth / 2,
        22,
        { align: 'center' },
    );

    // Información del reporte
    pdf.setTextColor(
        COLORS.textDark[0],
        COLORS.textDark[1],
        COLORS.textDark[2],
    );
    pdf.setFontSize(8);
    pdf.text(`Total de registros: ${data.rows.length}`, margin, 35);

    // Tabla con diseño profesional
    interface AutoTableMargin {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }

    interface AutoTableStyles {
        fontSize?: number;
        font?: string;
        cellPadding?: number;
        lineColor?: number[];
        lineWidth?: number;
        textColor?: number[] | number;
    }

    interface AutoTableHeadStyles extends AutoTableStyles {
        fillColor?: number[];
        fontStyle?: string;
        halign?: 'left' | 'center' | 'right';
    }

    interface AutoTableAlternateRowStyles {
        fillColor?: number[];
    }

    interface AutoTableColumnStyle {
        fontStyle?: string;
    }

    interface AutoTableDidDrawPageData {
        pageNumber: number;
    }

    interface AutoTableOptions {
        head?: (string | number | boolean | null)[][];
        body?: (string | number | boolean | null)[][];
        startY?: number;
        theme?: string;
        margin?: AutoTableMargin;
        styles?: AutoTableStyles;
        headStyles?: AutoTableHeadStyles;
        bodyStyles?: AutoTableStyles;
        alternateRowStyles?: AutoTableAlternateRowStyles;
        columnStyles?: Record<number, AutoTableColumnStyle>;
        didDrawPage?: (data: AutoTableDidDrawPageData) => void;
    }

    const autoTableOptions: AutoTableOptions = {
        head: [data.headers],
        body: data.rows,
        startY: 40,
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 9,
            font: 'helvetica',
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: themeColor,
            textColor: COLORS.textLight,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10,
        },
        bodyStyles: {
            textColor: COLORS.textDark,
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        columnStyles: {
            0: { fontStyle: 'bold' }, // Primera columna en negrita
        },
        didDrawPage: (d: AutoTableDidDrawPageData) => {
            // Footer en cada página
            const pageCount = pdf.getNumberOfPages();
            pdf.setFontSize(7);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `Página ${d.pageNumber} de ${pageCount}`,
                pageWidth / 2,
                pdf.internal.pageSize.getHeight() - 10,
                { align: 'center' },
            );
            pdf.text(
                `Confidencial - ${new Date().getFullYear()}`,
                pageWidth - margin,
                pdf.internal.pageSize.getHeight() - 10,
                { align: 'right' },
            );
        },
    };

    pdf.autoTable?.(autoTableOptions);

    // Resumen con diseño mejorado
    if (data.summary && Object.keys(data.summary).length > 0) {
        const finalY = pdf.lastAutoTable?.finalY ?? 30;

        // Encabezado del resumen
        pdf.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
        pdf.rect(margin, finalY + 15, pageWidth - 2 * margin, 8, 'F');

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(
            COLORS.textLight[0],
            COLORS.textLight[1],
            COLORS.textLight[2],
        );
        pdf.text('RESUMEN EJECUTIVO', margin + 5, finalY + 20);

        // Contenido del resumen
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        let yPosition = finalY + 32;

        Object.entries(data.summary).forEach(([key, value], index) => {
            // alternating background
            if (index % 2 === 0) {
                pdf.setFillColor(
                    COLORS.secondary[0],
                    COLORS.secondary[1],
                    COLORS.secondary[2],
                );
                pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, 'F');
            }
            // draw key and value on same line
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(
                COLORS.textDark[0],
                COLORS.textDark[1],
                COLORS.textDark[2],
            );
            pdf.text(`${key}:`, margin + 5, yPosition);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${value}`, pageWidth - margin - 5, yPosition, {
                align: 'right',
            });
            // move to next line
            yPosition += 10;
        });
    }

    const safeName =
        data.title
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()
            .substring(0, 50) || 'report';

    pdf.save(`${safeName}.pdf`);
}

/**
 * Export data to Excel with professional styling
 */
export function exportToExcel(data: ExportData, filename = 'report') {
    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Preparar datos
    const aoa: (string | number | boolean | null)[][] = [
        data.headers,
        ...data.rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Configuraciones avanzadas de columnas
    const colCount = data.headers.length;
    ws['!cols'] = Array(colCount).fill({
        wch: 20,
        width: 15,
    });

    // Congelar fila de encabezados
    ws['!freeze'] = { x: 0, y: 1 };

    // Filtros automáticos
    const lastCol = String.fromCharCode(64 + colCount);
    ws['!autofilter'] = { ref: `A1:${lastCol}1` };

    // Añadir resumen si existe
    if (data.summary && Object.keys(data.summary).length > 0) {
        // Espacio en blanco
        XLSX.utils.sheet_add_aoa(ws, [['']], { origin: -1 });

        // Encabezado del resumen
        XLSX.utils.sheet_add_aoa(ws, [['RESUMEN EJECUTIVO']], { origin: -1 });

        // Items del resumen
        const summaryRows = Object.entries(data.summary).map(([key, value]) => [
            key,
            value,
        ]);
        XLSX.utils.sheet_add_aoa(ws, summaryRows, { origin: -1 });
    }

    // Añadir hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // Generar archivo con nombre seguro
    const safeFilename = filename
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);

    XLSX.writeFile(wb, `${safeFilename}.xlsx`);
}

// Función adicional para exportar múltiples formatos
export function exportMultipleFormats(
    data: ExportData,
    baseFilename = 'report',
) {
    exportToPDF(data);
    exportToExcel(data, baseFilename);
}

export default {
    exportToPDF,
    exportToExcel,
    exportMultipleFormats,
};
