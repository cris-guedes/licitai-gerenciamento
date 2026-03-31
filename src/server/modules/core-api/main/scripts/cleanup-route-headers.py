import os
import re

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # 1. Remove manual headers from schema objects
    # Handle both "headers: AuthHeader" and "headers: AuthHeaders" with optional trailing comma and spaces
    content = re.sub(r'headers:\s+AuthHeaders?,\s*', '', content)
    content = re.sub(r'headers:\s+AuthHeaders?\s*', '', content) # Handle cases without comma if any
    
    # 2. Check for unused imports in HeaderTypes
    # We look at the code AFTER the imports to see if the tokens are still used
    # A simple way is to check the part of the file after the last import
    imports_end = content.rfind('import')
    code_after_imports = content[content.find(';', imports_end) + 1:] if imports_end != -1 else content
    
    has_auth_header = bool(re.search(r'\bAuthHeader\b', code_after_imports))
    has_auth_headers = bool(re.search(r'\bAuthHeaders\b', code_after_imports))
    
    # 3. Cleanup imports from '@/domain/shared/HeaderTypes'
    header_types_import_match = re.search(r"import\s*{([^}]*)}\s*from\s*'@/domain/shared/HeaderTypes';", content)
    if header_types_import_match:
        import_tokens = [t.strip() for t in header_types_import_match.group(1).split(',')]
        new_tokens = []
        for token in import_tokens:
            if token == 'AuthHeader' and not has_auth_header:
                continue
            if token == 'AuthHeaders' and not has_auth_headers:
                continue
            if token:
                new_tokens.append(token)
        
        if not new_tokens:
            # Remove entire import line
            content = re.sub(r"import\s*{[^}]*}\s*from\s*'@/domain/shared/HeaderTypes';\n?", "", content)
        else:
            new_import_str = f"import {{ {', '.join(new_tokens)} }} from '@/domain/shared/HeaderTypes';"
            content = content.replace(header_types_import_match.group(0), new_import_str)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    routes_dir = os.path.join(os.getcwd(), 'src', 'routes')
    processed_count = 0
    for f in os.listdir(routes_dir):
        if f.endswith('.routes.ts'):
            if process_file(os.path.join(routes_dir, f)):
                print(f"Cleaned up: {f}")
                processed_count += 1
    print(f"Done. Processed {processed_count} files.")

if __name__ == "__main__":
    main()
