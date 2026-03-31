import os
import re

def process_file(file_path):
    print(f"Checking: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize backslashes if any remain (paranoid check)
    content = content.replace("from \\'@/domain/shared/HeaderTypes\\';", "from '@/domain/shared/HeaderTypes';")

    # Target pattern: Headers: AuthEstablishmentHeader & AuthHeader;
    target_pattern = "Headers: AuthEstablishmentHeader & AuthHeader;"
    target_import = "import { AuthEstablishmentHeader, AuthHeader } from '@/domain/shared/HeaderTypes';"

    # Find the interface name (e.g., GetAppointmentsControllerTypes)
    match = re.search(r'interface\s+(\w+ControllerTypes)\s*\{', content)
    if not match:
        print(f"  Skipping: Interface not found.")
        return False
    
    interface_name = match.group(1)

    # 1. Handle Imports
    # If any import from HeaderTypes exists, replace it with our target import
    if "from '@/domain/shared/HeaderTypes';" in content:
        content = re.sub(r"import \{ [^}]* \} from '@/domain/shared/HeaderTypes';", target_import, content)
    else:
        # Insert after the first import line
        content = re.sub(r'(import .*;\n)', rf"\1{target_import}\n", content, count=1)

    # 2. Handle Interface property
    # If Headers property exists, replace its value
    if "Headers:" in content:
        content = re.sub(r'Headers:\s*[^;]*;', target_pattern, content)
    else:
        # Insert at the top of the interface
        content = content.replace(f'interface {interface_name} {{', f'interface {interface_name} {{\n    {target_pattern}')

    # 3. Handle Namespace export
    if "export type Headers =" in content:
        content = re.sub(r"export\s+type\s+Headers\s+=\s+[^;]*;", f"export type Headers = {interface_name}['Headers'];", content)
    else:
        content = re.sub(
            rf'(export\s*type\s*Types\s*=\s*{interface_name}\s*;)',
            f"\\1\n    export type Headers = {interface_name}['Headers'];",
            content
        )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    base_path = os.path.join(os.getcwd(), 'src', 'domain', 'use-cases')
    count = 0
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('Controller.ts'):
                file_path = os.path.join(root, file)
                if process_file(file_path):
                    print(f"  --> Processed successfully.")
                    count += 1
    
    print(f"\nTotal files processed: {count}")

if __name__ == "__main__":
    main()
