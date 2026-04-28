// Datos hardcodeados solo para mockups, no se usan en la app real.

export const mockUserName = "Javier";

export const mockRecentNotes = [
    {
        id: "1",
        title: "Apuntes clase de Algebra",
        preview: "Vectores, espacios vectoriales y combinaciones lineales...",
        folder: "Matematicas",
        updatedAt: "hace 2 minutos",
    },
    {
        id: "2",
        title: "Ideas TFG",
        preview: "Plataforma de notas con IA contextual para estudiantes...",
        folder: "Inbox",
        updatedAt: "hace 1 hora",
    },
    {
        id: "3",
        title: "Receta tarta de queso",
        preview: "200g queso crema, 100g azucar, 3 huevos batidos...",
        folder: "Inbox",
        updatedAt: "ayer",
    },
    {
        id: "4",
        title: "Bibliografia historia contemporanea",
        preview: "Hobsbawm, Eric. La era de los imperios 1875-1914...",
        folder: "Historia",
        updatedAt: "ayer",
    },
    {
        id: "5",
        title: "Lista de la compra",
        preview: "Pan, leche, cafe, fruta...",
        folder: "Inbox",
        updatedAt: "hace 3 dias",
    },
];

export const mockFolders = [
    { id: "1", name: "Inbox", noteCount: 8, isDefault: true },
    { id: "2", name: "Matematicas", noteCount: 12, isDefault: false },
    { id: "3", name: "Historia", noteCount: 5, isDefault: false },
    { id: "4", name: "Lengua", noteCount: 7, isDefault: false },
    { id: "5", name: "Proyectos personales", noteCount: 3, isDefault: false },
];
