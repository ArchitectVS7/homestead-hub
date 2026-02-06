import { getAnimalById } from "@/actions/livestock";
import { AnimalDetailView } from "./animal-detail-view";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function AnimalPage({ params }: PageProps) {
    const animal = await getAnimalById(params.id);

    if (!animal) {
        notFound();
    }

    // Serialize dates
    const serializedAnimal = {
        ...animal,
        birthDate: animal.birthDate,
        updatedAt: animal.updatedAt,
        createdAt: animal.createdAt,
        healthRecords: animal.healthRecords.map(h => ({ ...h, date: h.date, nextDue: h.nextDue })),
        productionLogs: animal.productionLogs.map(p => ({ ...p, date: p.date })),
    };

    return <AnimalDetailView animal={serializedAnimal} />;
}
