import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as f:
    install_requires = f.read().splitlines()

setuptools.setup(
    name="hackernews-mcp-service",
    version="0.1.0",
    author="AI Assistant",
    author_email="assistant@example.com",
    description="A service to fetch top Hacker News stories by comment count.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/placeholder/hackernews-mcp-service", # Placeholder URL
    packages=setuptools.find_packages(), # Discovers the 'hackernews_mcp_service' package
    install_requires=install_requires,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.7', # Changed from 3.6 due to f-strings in open() and find_packages() best practices
    entry_points={
        'console_scripts': [
            'hackernews-top-stories=hackernews_mcp_service.client:main_cli',
        ],
    },
)
