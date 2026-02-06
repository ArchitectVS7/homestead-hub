import * as React from "react";
import { cn } from "@/lib/utils";

// --- Primitives ---

const TableRoot = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
        />
    </div>
))
TableRoot.displayName = "Table"

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b transition-colors data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"


// --- High Level Wrapper (Backward Compatibility) ---

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

function DataTable<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    isLoading,
    emptyMessage = "No data available",
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full h-48 flex items-center justify-center bg-white rounded-xl border border-soil-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-48 flex items-center justify-center bg-white rounded-xl border border-soil-200 text-soil-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-xl border border-soil-200 bg-white shadow-sm">
            <TableRoot>
                <TableHeader className="bg-soil-50">
                    <TableRow>
                        {columns.map((col, index) => (
                            <TableHead key={index} className={col.className}>{col.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(item => (
                        <TableRow
                            key={keyExtractor(item)}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                            className={onRowClick ? "cursor-pointer hover:bg-soil-50" : ""}
                        >
                            {columns.map((col, index) => (
                                <TableCell key={index} className={col.className}>
                                    {col.cell ? col.cell(item) : (col.accessorKey ? (item[col.accessorKey] as any) : null)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </TableRoot>
        </div>
    );
}

// Export "Table" as the primitive to match shadcn pattern in new files
// Export "DataTable" for the high-level shared component
export {
    TableRoot as Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
    DataTable, // Renamed from "Table" to avoid conflict, legacy usage needs update? Or just alias?
    // Actually, to avoid breaking existing "import { Table } from ...", I should probably keep the name if generic.
    // BUT the new files expect { Table, TableBody... }.
    // Let's resolve this by exporting the Primitives as named exports.
    // And the generic one as... "SharedTable"? Or keep it as "Table" but wait, that conflicts with TableRoot.
    // The existing import was: `import { Table } from "@/components/ui/table";` used as `<Table data={...} ... />`
    // The NEW imports are: `import { Table, TableBody... }` used as `<Table><TableBody>...`
    // This is a conflict.
    // I will rename the High Level one to "DataTable" and fix the call sites.
}
